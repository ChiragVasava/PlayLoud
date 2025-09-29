// utils/googleProfileHelper.js
export const fetchGoogleProfilePicture = async (user) => {
  try {
    // Check if user has Google provider data
    if (user.providerUid && user.provider === 'google') {
      // Construct Google profile picture URL
      const photoUrl = `https://lh3.googleusercontent.com/a/default-user=${user.providerUid}=s150-c`;
      
      // Verify the image exists
      const response = await fetch(photoUrl, { method: 'HEAD' });
      if (response.ok) {
        return photoUrl;
      }
    }
    
    // Fallback: try to extract from Google's People API if access token is available
    if (user.accessToken) {
      const profileResponse = await fetch(
        `https://people.googleapis.com/v1/people/me?personFields=photos&access_token=${user.accessToken}`
      );
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.photos && profileData.photos.length > 0) {
          return profileData.photos[0].url;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Google profile picture:', error);
    return null;
  }
};