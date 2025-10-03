// utils/appwriteAuth.js - Complete Implementation
import { account, storage, ID, BUCKET_ID } from '../lib/appwrite';

class AppwriteAuthService {
    constructor() {
        this.currentUser = null;
    }

    // Get current user with enhanced profile data
    async getCurrentUser() {
        try {
            const user = await account.get();
            this.currentUser = user;

            return {
                ...user,
                avatar: await this.getUserAvatar(user),
                displayName: user.prefs?.displayName || user.name || user.email?.split('@')[0] || 'User'
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Get user avatar from various sources
    async getUserAvatar(user) {
        // Priority order:
        // 1. Custom uploaded avatar (stored in preferences)
        // 2. Google OAuth2 profile picture
        // 3. Generated initials avatar

        // Check for uploaded profile picture
        if (user.prefs?.profileImageFileId) {
            try {
                const avatarUrl = storage.getFileView(
                    BUCKET_ID,
                    user.prefs.profileImageFileId
                );
                return avatarUrl;
            } catch (error) {
                console.error('Error getting avatar from storage:', error);
            }
        }

        // Check for Google OAuth2 profile picture
        if (user.prefs?.googleAvatar) {
            return user.prefs.googleAvatar;
        }

        // For Google OAuth2 users - try to get their profile picture
        if (user.providerUid && (user.provider === 'google' || user.providerAccessToken)) {
            try {
                const googleAvatar = await this.fetchGoogleProfilePicture(user);
                if (googleAvatar) {
                    // Save Google avatar to preferences for faster access next time
                    await account.updatePrefs({
                        ...user.prefs,
                        googleAvatar: googleAvatar
                    });
                    return googleAvatar;
                }
            } catch (error) {
                console.error('Error fetching Google avatar:', error);
            }
        }

        // Fallback to generated initials avatar
        return this.generateInitialsAvatar(user.name || user.email);
    }

    // Fetch Google profile picture
    async fetchGoogleProfilePicture(user) {
        try {
            // Method 1: Try Google's photo URL pattern (works for most accounts)
            if (user.providerUid) {
                const photoUrl = `https://lh3.googleusercontent.com/a/default-user=${user.providerUid}`;

                // Verify the image exists
                try {
                    const response = await fetch(photoUrl, { method: 'HEAD' });
                    if (response.ok) {
                        return photoUrl;
                    }
                } catch (error) {
                    console.log('Google photo URL method 1 failed, trying alternative...');
                }
            }

            // Method 2: Extract from email (for some Google accounts)
            if (user.email && user.email.includes('@gmail.com')) {
                const emailHash = user.email.split('@')[0];
                const alternativeUrl = `https://lh3.googleusercontent.com/a-/default-user=${emailHash}`;

                try {
                    const response = await fetch(alternativeUrl, { method: 'HEAD' });
                    if (response.ok) {
                        return alternativeUrl;
                    }
                } catch (error) {
                    console.log('Google photo URL method 2 failed');
                }
            }

            // Method 3: If user has access token, try Google People API
            if (user.providerAccessToken) {
                try {
                    const peopleResponse = await fetch(
                        `https://people.googleapis.com/v1/people/me?personFields=photos`,
                        {
                            headers: {
                                'Authorization': `Bearer ${user.providerAccessToken}`
                            }
                        }
                    );

                    if (peopleResponse.ok) {
                        const peopleData = await peopleResponse.json();
                        if (peopleData.photos && peopleData.photos.length > 0) {
                            return peopleData.photos[0].url;
                        }
                    }
                } catch (error) {
                    console.log('Google People API method failed');
                }
            }

            return null;
        } catch (error) {
            console.error('Error fetching Google profile picture:', error);
            return null;
        }
    }

    // Upload user profile picture
    async uploadProfilePicture(file, userId) {
        try {
            // Validate file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return { success: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                return { success: false, error: 'File size must be less than 5MB' };
            }

            // Delete old profile picture if exists
            await this.deleteOldProfilePicture(userId);

            // Upload new file
            const response = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                file
            );

            // Get file view URL
            const avatarUrl = storage.getFileView(
                BUCKET_ID,
                response.$id
            );

            // Update user preferences with new profile image
            const currentUser = await account.get();
            await account.updatePrefs({
                ...currentUser.prefs,
                profileImageFileId: response.$id,
                profileImageUrl: avatarUrl.toString(),
                lastProfileUpdate: Date.now()
            });

            return {
                success: true,
                fileId: response.$id,
                avatarUrl: avatarUrl.toString()
            };

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete old profile picture when uploading new one
    async deleteOldProfilePicture(userId) {
        try {
            const user = await account.get();
            if (user.prefs?.profileImageFileId) {
                await storage.deleteFile(
                    BUCKET_ID,
                    user.prefs.profileImageFileId
                );
            }
        } catch (error) {
            console.error('Error deleting old profile picture:', error);
            // Don't throw error, just log it
        }
    }

    // Handle OAuth2 success callback
    async handleOAuth2Success() {
        try {
            const user = await account.get();

            // Extract Google profile picture if available
            if (user.provider === 'google' && !user.prefs?.googleAvatar) {
                const googleAvatarUrl = await this.fetchGoogleProfilePicture(user);
                if (googleAvatarUrl) {
                    await account.updatePrefs({
                        ...user.prefs,
                        googleAvatar: googleAvatarUrl
                    });
                }
            }

            // Store in localStorage
            localStorage.setItem('playloud_user', JSON.stringify(user));
            localStorage.setItem('playloud_auth', 'true');

            // Trigger auth change event
            window.dispatchEvent(new Event('authChange'));

            return { success: true, user };
        } catch (error) {
            console.error('Error handling OAuth2 success:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate fallback avatar with initials
    generateInitialsAvatar(name) {
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const colors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
            '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
        ];

        const color = colors[name.length % colors.length];

        const svg = `
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <circle cx="75" cy="75" r="75" fill="${color}"/>
        <text x="75" y="85" font-family="Arial, sans-serif" font-size="50" 
              fill="white" text-anchor="middle" font-weight="bold">${initials}</text>
      </svg>
    `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Update user display name
    async updateDisplayName(displayName) {
        try {
            const currentUser = await account.get();
            await account.updatePrefs({
                ...currentUser.prefs,
                displayName: displayName
            });

            // Also update the account name
            await account.updateName(displayName);

            // Trigger auth change event
            window.dispatchEvent(new Event('authChange'));

            return { success: true };
        } catch (error) {
            console.error('Error updating display name:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('playloud_auth') === 'true';
    }
}

export default new AppwriteAuthService();