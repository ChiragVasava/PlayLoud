// components/pages/LikedSongs.jsx (REAL DATA + FEATURES)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG, Query, ID } from '../../lib/appwrite';
import { useMusic } from '../../context/useMusic';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PlusIcon, PlayIcon } from '@heroicons/react/24/outline';

const LikedSongs = () => {
  const navigate = useNavigate();
  const { playSong } = useMusic();
  
  const [likedSongsData, setLikedSongsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('playloud_user'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Fetch liked songs
  useEffect(() => {
    const loadLikedSongs = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's liked songs
        const likedResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'liked_songs',
          [
            Query.equal('userId', currentUser.$id),
            Query.orderDesc('likedAt'),
            Query.limit(100)
          ]
        );

        console.log(`✅ Found ${likedResponse.documents.length} liked songs`);

        // Get full song details for each liked song
        const songPromises = likedResponse.documents.map(async (likedDoc) => {
          try {
            const song = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              'songs',
              likedDoc.songId
            );

            return {
              $id: song.$id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              genre: song.genre,
              duration: song.duration,
              coverImage: song.coverImage,
              audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`,
              likedAt: likedDoc.likedAt,
              likedDocId: likedDoc.$id
            };
          } catch (error) {
            console.error(`Error fetching song ${likedDoc.songId}:`, error);
            return null;
          }
        });

        const songs = await Promise.all(songPromises);
        const validSongs = songs.filter(song => song !== null);

        setLikedSongsData(validSongs);

        // Fetch user playlists for "Add to Playlist" menu
        try {
          const playlistsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            'playlists',
            [Query.equal('userId', currentUser.$id), Query.limit(50)]
          );
          setUserPlaylists(playlistsResponse.documents);
        } catch (playlistError) {
          console.error('Error fetching user playlists:', playlistError);
        }

      } catch (error) {
        console.error('Error loading liked songs:', error);
        setError('Failed to load liked songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadLikedSongs();

    // Close playlist menu when clicking outside
    const handleClickOutside = (event) => {
      if (showPlaylistMenu && !event.target.closest('.playlist-menu')) {
        setShowPlaylistMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, [currentUser]);

  const handlePlaySong = (song) => {
    playSong(song);
  };

  const handlePlayAll = () => {
    if (likedSongsData.length > 0) {
      playSong(likedSongsData[0]);
    }
  };

  // ❤️ Handle unlike (remove from liked songs)
  const handleUnlike = async (e, songId, likedDocId) => {
    e.stopPropagation();

    try {
      // Delete from liked_songs collection
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        'liked_songs',
        likedDocId
      );

      // Remove from local state
      setLikedSongsData(prev => prev.filter(song => song.$id !== songId));
      console.log('✅ Song removed from liked songs');

    } catch (error) {
      console.error('Error unliking song:', error);
      alert('Failed to unlike song');
    }
  };

  // ➕ Handle add to playlist
  const handleAddToPlaylist = async (e, songId, playlistId) => {
    e.stopPropagation();
    setIsAddingToPlaylist(true);

    try {
      // Check if song is already in playlist
      const existingCheck = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'playlist_songs',
        [
          Query.equal('playlistId', playlistId),
          Query.equal('songId', songId)
        ]
      );

      if (existingCheck.documents.length > 0) {
        alert('Song is already in this playlist');
        setIsAddingToPlaylist(false);
        return;
      }

      // Get current highest order number
      const orderCheck = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'playlist_songs',
        [
          Query.equal('playlistId', playlistId),
          Query.orderDesc('order'),
          Query.limit(1)
        ]
      );

      const nextOrder = orderCheck.documents.length > 0
        ? orderCheck.documents[0].order + 1
        : 1;

      // Add song to playlist
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'playlist_songs',
        ID.unique(),
        {
          playlistId: playlistId,
          songId: songId,
          order: nextOrder,
          addedAt: new Date().toISOString()
        }
      );

      // Update playlist song count
      const playlist = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'playlists',
        playlistId
      );

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'playlists',
        playlistId,
        {
          songCount: (playlist.songCount || 0) + 1
        }
      );

      alert(`✅ Added to "${playlist.name}" playlist`);
      setShowPlaylistMenu(null);

    } catch (error) {
      console.error('Error adding song to playlist:', error);
      alert('Failed to add song to playlist');
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your liked songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <HeartSolid className="w-24 h-24 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-medium">Playlist</p>
          <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
          <p className="text-gray-400">{likedSongsData.length} song{likedSongsData.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Play Button */}
      {likedSongsData.length > 0 && (
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
          >
            <PlayIcon className="w-6 h-6 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Songs List */}
      {likedSongsData.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartOutline className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No liked songs yet</h3>
          <p className="text-gray-500 mb-6">Songs you like will appear here</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Browse Music
          </button>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 text-sm text-gray-400 font-medium">
              <div>#</div>
              <div>Title</div>
              <div>Album</div>
              <div>Duration</div>
              <div className="w-24">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {likedSongsData.map((song, index) => (
              <div
                key={song.$id}
                className="p-4 hover:bg-gray-700/50 transition-colors group cursor-pointer relative"
              >
                <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center text-sm">
                  <div className="text-gray-400 group-hover:hidden">{index + 1}</div>
                  <div className="hidden group-hover:flex items-center">
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3"
                    >
                      <PlayIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div onClick={() => handlePlaySong(song)} className="flex items-center space-x-3">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40/4a5568/ffffff?text=♪';
                      }}
                    />
                    <div>
                      <p className="text-white font-medium">{song.title}</p>
                      <p className="text-gray-400">{song.artist}</p>
                    </div>
                  </div>

                  <div className="text-gray-400">{song.album}</div>
                  <div className="text-gray-400">{formatDuration(song.duration)}</div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Unlike Button */}
                    <button
                      onClick={(e) => handleUnlike(e, song.$id, song.likedDocId)}
                      className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                      title="Unlike"
                    >
                      <HeartSolid className="w-5 h-5 text-red-500" />
                    </button>

                    {/* Add to Playlist */}
                    <div className="relative playlist-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlaylistMenu(showPlaylistMenu === song.$id ? null : song.$id);
                        }}
                        className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                        title="Add to playlist"
                      >
                        <PlusIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                      </button>

                      {showPlaylistMenu === song.$id && (
                        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 py-2">
                          <div className="px-4 py-2 border-b border-gray-700">
                            <h4 className="text-sm font-semibold text-white">Add to Playlist</h4>
                          </div>

                          {isAddingToPlaylist ? (
                            <div className="px-4 py-3 text-center">
                              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                          ) : userPlaylists.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              {userPlaylists.map(playlist => (
                                <button
                                  key={playlist.$id}
                                  onClick={(e) => handleAddToPlaylist(e, song.$id, playlist.$id)}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors flex items-center"
                                >
                                  <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="truncate">{playlist.name}</p>
                                    <p className="text-xs text-gray-400">{playlist.songCount || 0} songs</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-center text-gray-400 text-sm">
                              <p>No playlists available</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPlaylistMenu(null);
                                  navigate('/create-playlist');
                                }}
                                className="mt-2 text-green-400 hover:underline"
                              >
                                Create Playlist
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LikedSongs;