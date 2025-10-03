// utils/database.js
import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68b09ea20010c1700ac0');

export const databases = new Databases(client);
export const DATABASE_ID = '68b09f3f002c9814dc20'; // Create in Appwrite Console

// Collection IDs
export const COLLECTIONS = {
  SONGS: 'songs',
  PLAYLISTS: 'playlists',
  PLAYLIST_SONGS: 'playlist_songs',
  LIKED_SONGS: 'liked_songs',
  USER_ACTIVITY: 'user_activity'
};

// Database schemas
export const SCHEMAS = {
  SONGS: {
    id: 'string',
    title: 'string',
    artist: 'string',
    album: 'string',
    duration: 'integer', // in seconds
    fileId: 'string', // Appwrite storage file ID
    coverImageId: 'string', // optional
    uploadedBy: 'string', // user ID
    createdAt: 'datetime',
    updatedAt: 'datetime'
  },

  PLAYLISTS: {
    id: 'string',
    name: 'string',
    description: 'string',
    userId: 'string',
    isPublic: 'boolean',
    coverImageId: 'string', // optional
    songCount: 'integer',
    totalDuration: 'integer',
    createdAt: 'datetime',
    updatedAt: 'datetime'
  },

  PLAYLIST_SONGS: {
    id: 'string',
    playlistId: 'string',
    songId: 'string',
    order: 'integer',
    addedAt: 'datetime'
  },

  LIKED_SONGS: {
    id: 'string',
    userId: 'string',
    songId: 'string',
    likedAt: 'datetime'
  }
};