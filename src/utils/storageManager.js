// utils/storageManager.js
import { storage, BUCKET_ID } from '../lib/appwrite';

export const STORAGE_FOLDERS = {
  MUSIC: 'music/',
  IMAGES: 'images/',
  PROFILE_PICS: 'profile-pics/',
  PLAYLIST_COVERS: 'playlist-covers/',
  VIDEOS: 'videos/'
};

export const StorageManager = {
  // Upload music file
  uploadMusic: async (file, fileName) => {
    const musicId = `${STORAGE_FOLDERS.MUSIC}${fileName}`;
    return await storage.createFile(BUCKET_ID, musicId, file);
  },

  // Upload profile picture
  uploadProfilePic: async (file, userId) => {
    const profileId = `${STORAGE_FOLDERS.PROFILE_PICS}${userId}_${Date.now()}`;
    return await storage.createFile(BUCKET_ID, profileId, file);
  },

  // Get file URL
  getFileUrl: (fileId) => {
    return storage.getFileView(BUCKET_ID, fileId);
  },

  // Delete file
  deleteFile: async (fileId) => {
    return await storage.deleteFile(BUCKET_ID, fileId);
  }
};