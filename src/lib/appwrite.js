// src/lib/appwrite.js (UPDATED)
import { Client, Account, OAuthProvider, ID, Storage, Databases, Query } from 'appwrite';

// Create Appwrite client
export const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Account instance
export const account = new Account(client);

// Storage instance
export const storage = new Storage(client);

// Databases instance
export const databases = new Databases(client);

// Export constants
export { ID, OAuthProvider, Query };

// Environment variables
export const APPWRITE_CONFIG = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID
};

// Collection IDs (you'll create these in Appwrite Console)
export const COLLECTIONS = {
    SONGS: 'songs',
    PLAYLISTS: 'playlists',
    PLAYLIST_SONGS: 'playlist_songs',
    LIKED_SONGS: 'liked_songs',
    RECENTLY_PLAYED: 'recently_played'
};

export const BUCKET_ID = '68b0a1aa0028885b31e0';