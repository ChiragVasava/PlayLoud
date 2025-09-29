// utils/appwriteAuth.js (UPDATED FOR SINGLE BUCKET)
import { account, storage, ID, BUCKET_ID } from '../lib/appwrite';

class AppwriteAuthService {
  // ... existing methods (login, register, logout, etc.)

  // Get current user with enhanced profile data
  async getCurrentUser() {
    try {
      const user = await account.get();
      return {
        ...user,
        avatar: await this.getUserAvatar(user),
        displayName: user.prefs?.displayName || user.name || 'User'
      };
    } catch (error) {
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
        const avatarUrl = await storage.getFileView({
          bucketId: BUCKET_ID,
          fileId: user.prefs.profileImageFileId
        });
        return avatarUrl;
      } catch (error) {
        console.error('Error getting avatar from storage:', error);
      }
    }

    // Check for Google OAuth2 profile picture
    if (user.prefs?.googleAvatar) {
      return user.prefs.googleAvatar;
    }

    // For Google OAuth2 users
    if (user.providerUid && user.provider === 'google') {
      const googleAvatar = `https://lh3.googleusercontent.com/a/default-user=${user.providerUid}=s150-c`;
      
      // Save Google avatar to preferences for faster access
      try {
        await account.updatePrefs({
          ...user.prefs,
          googleAvatar: googleAvatar
        });
        return googleAvatar;
      } catch (error) {
        return googleAvatar;
      }
    }

    return this.generateInitialsAvatar(user.name || user.email);
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

      // Create unique filename with user ID and timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const customFileName = `profile_${userId}_${timestamp}.${fileExtension}`;

      // Upload file with latest Appwrite syntax
      const response = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: ID.unique(),
        file: file
      });

      // Get file view URL
      const avatarUrl = await storage.getFileView({
        bucketId: BUCKET_ID,
        fileId: response.$id
      });

      // Update user preferences with new profile image
      const currentUser = await account.get();
      await account.updatePrefs({
        ...currentUser.prefs,
        profileImageFileId: response.$id,
        profileImageUrl: avatarUrl,
        lastProfileUpdate: timestamp
      });

      return { 
        success: true, 
        fileId: response.$id,
        avatarUrl: avatarUrl 
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
        await storage.deleteFile({
          bucketId: BUCKET_ID,
          fileId: user.prefs.profileImageFileId
        });
      }
    } catch (error) {
      console.error('Error deleting old profile picture:', error);
      // Don't throw error, just log it
    }
  }

  // Handle OAuth2 success callback (from your Option 3 choice)
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

      window.dispatchEvent(new Event('authChange'));
      return { success: true, user };
    } catch (error) {
      console.error('Error handling OAuth2 success:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch Google profile picture
  async fetchGoogleProfilePicture(user) {
    try {
      if (user.providerUid && user.provider === 'google') {
        const photoUrl = `https://lh3.googleusercontent.com/a/default-user=${user.providerUid}=s150-c`;
        
        // Verify the image exists
        const response = await fetch(photoUrl, { method: 'HEAD' });
        if (response.ok) {
          return photoUrl;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Google profile picture:', error);
      return null;
    }
  }

  // Generate fallback avatar
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
}

export default new AppwriteAuthService();