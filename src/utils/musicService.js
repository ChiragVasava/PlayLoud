// musicService.js
import { databases, DATABASE_ID, COLLECTIONS } from './database';

import { Query, ID } from 'appwrite';
import authService from './auth';
import { APPWRITE_CONFIG } from '../lib/appwrite';

export const musicService = {
  // Create a song record
  createSong: async (songData) => {
    try {
      const user = authService.getCurrentUser();
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SONGS,
        ID.unique(),
        {
          ...songData,
          uploadedBy: user.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error creating song:', error);
      throw error;
    }
  },

  // Get all songs
  getAllSongs: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SONGS,
        [Query.orderDesc('createdAt')]
      );

      // attach playable URL to each song
      return response.documents.map(song => ({
        ...song,
        audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`
      }));
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  // Create playlist
  createPlaylist: async (playlistData) => {
    try {
      const user = authService.getCurrentUser();
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PLAYLISTS,
        ID.unique(),
        {
          ...playlistData,
          userId: user.$id,
          songCount: 0,
          totalDuration: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  // Get user playlists
  getUserPlaylists: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYLISTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('updatedAt')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId, songId) => {
    try {
      const playlistSongs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYLIST_SONGS,
        [Query.equal('playlistId', playlistId)]
      );

      const result = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PLAYLIST_SONGS,
        ID.unique(),
        {
          playlistId,
          songId,
          order: playlistSongs.documents.length,
          addedAt: new Date().toISOString()
        }
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PLAYLISTS,
        playlistId,
        {
          songCount: playlistSongs.documents.length + 1,
          updatedAt: new Date().toISOString()
        }
      );

      return result;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  },

  // Fetch songs of a playlist with audioUrl attached
  getPlaylistSongs: async (playlistId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYLIST_SONGS,
        [
          Query.equal('playlistId', playlistId),
          Query.orderAsc('order')
        ]
      );

      const songsWithDetails = await Promise.all(
        response.documents.map(async (playlistSong) => {
          const song = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.SONGS,
            playlistSong.songId
          );

          return {
            ...song,
            audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`,
            playlistOrder: playlistSong.order
          };
        })
      );

      return songsWithDetails;
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      throw error;
    }
  },

  // Like/Unlike a song
  toggleLikeSong: async (songId) => {
    try {
      const user = authService.getCurrentUser();
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LIKED_SONGS,
        [
          Query.equal('userId', user.$id),
          Query.equal('songId', songId)
        ]
      );

      if (existing.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.LIKED_SONGS,
          existing.documents[0].$id
        );
        return false;
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.LIKED_SONGS,
          ID.unique(),
          {
            userId: user.$id,
            songId,
            likedAt: new Date().toISOString()
          }
        );
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Get liked songs for a user
  getUserLikedSongs: async (userId) => {
    try {
      const likedSongs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LIKED_SONGS,
        [Query.equal('userId', userId), Query.orderDesc('likedAt')]
      );

      return Promise.all(
        likedSongs.documents.map(async (liked) => {
          const song = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.SONGS,
            liked.songId
          );
          return {
            ...song,
            audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`,
            likedAt: liked.likedAt,
          };
        })
      );
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      throw error;
    }
  }
};

export default musicService;