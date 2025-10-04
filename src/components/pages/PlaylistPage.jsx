// components/pages/PlaylistPage.jsx (WITH LIKE & PLAYLIST FEATURES)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG, Query, ID } from '../../lib/appwrite';
import { useMusic } from '../../context/useMusic';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useMusic();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('playloud_user'));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const loadPlaylistData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch playlist details
        const playlistResponse = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          'playlists',
          id
        );

        setPlaylist(playlistResponse);

        // Fetch songs in this playlist
        const songsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'playlist_songs',
          [
            Query.equal('playlistId', id),
            Query.orderAsc('order'),
            Query.limit(100)
          ]
        );

        // Get song details for each playlist song
        const songPromises = songsResponse.documents.map(async (playlistSong) => {
          try {
            const songResponse = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              'songs',
              playlistSong.songId
            );
            
            return {
              $id: songResponse.$id,
              title: songResponse.title,
              artist: songResponse.artist,
              album: songResponse.album,
              genre: songResponse.genre,
              duration: songResponse.duration,
              coverImage: songResponse.coverImage,
              audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${songResponse.fileId}/view?project=${APPWRITE_CONFIG.projectId}`,
              order: playlistSong.order,
              playlistSongId: playlistSong.$id
            };
          } catch (error) {
            console.error(`Error fetching song ${playlistSong.songId}:`, error);
            return null;
          }
        });

        const songDetails = await Promise.all(songPromises);
        const validSongs = songDetails.filter(song => song !== null);

        setSongs(validSongs);

        // Fetch user's liked songs if logged in
        if (currentUser) {
          try {
            const likedResponse = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              'liked_songs',
              [Query.equal('userId', currentUser.$id), Query.limit(100)]
            );
            
            const likedIds = new Set(likedResponse.documents.map(doc => doc.songId));
            setLikedSongs(likedIds);
          } catch (likedError) {
            console.error('Error fetching liked songs:', likedError);
          }
          
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
        }

      } catch (error) {
        console.error('Error loading playlist:', error);
        if (error?.code === 404) {
          setError('Playlist not found');
        } else if (error?.code === 403) {
          setError('Access denied to this playlist');
        } else {
          setError('Failed to load playlist');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadPlaylistData();
    }
    
    // Close playlist menu when clicking outside
    const handleClickOutside = (event) => {
      if (showPlaylistMenu && !event.target.closest('.playlist-menu')) {
        setShowPlaylistMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    
  }, [id, currentUser]);

  const handlePlaySong = (song) => {
    playSong(song);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  };

  // ❤️ Handle like/unlike toggle
  const handleToggleLike = async (e, songId) => {
    e.stopPropagation();
    
    if (!currentUser) {
      alert('Please log in to like songs');
      navigate('/login');
      return;
    }
    
    try {
      const isCurrentlyLiked = likedSongs.has(songId);
      
      if (isCurrentlyLiked) {
        // Unlike
        const likedDoc = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'liked_songs',
          [
            Query.equal('userId', currentUser.$id),
            Query.equal('songId', songId)
          ]
        );
        
        if (likedDoc.documents.length > 0) {
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            'liked_songs',
            likedDoc.documents[0].$id
          );
          
          const newLikedSongs = new Set(likedSongs);
          newLikedSongs.delete(songId);
          setLikedSongs(newLikedSongs);
        }
        
      } else {
        // Like
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          'liked_songs',
          ID.unique(),
          {
            userId: currentUser.$id,
            songId: songId,
            likedAt: new Date().toISOString()
          }
        );
        
        const newLikedSongs = new Set(likedSongs);
        newLikedSongs.add(songId);
        setLikedSongs(newLikedSongs);
      }
      
    } catch (error) {
      console.error('Error toggling like status:', error);
      alert('Failed to update like status');
    }
  };

  // ➕ Handle add to playlist
  const handleAddToPlaylist = async (e, songId, playlistId) => {
    e.stopPropagation();
    
    if (!currentUser) {
      alert('Please log in to add songs to playlists');
      navigate('/login');
      return;
    }
    
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
      const targetPlaylist = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'playlists',
        playlistId
      );
      
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'playlists',
        playlistId,
        {
          songCount: (targetPlaylist.songCount || 0) + 1
        }
      );
      
      alert(`✅ Added to "${targetPlaylist.name}" playlist`);
      setShowPlaylistMenu(null);
      
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      alert('Failed to add song to playlist');
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-400">Playlist not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-4"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Playlist Header */}
      <section>
        <div className="flex items-end gap-6">
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-48 h-48 object-cover rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300/4a5568/ffffff?text=♪';
            }}
          />
          <div className="flex-1">
            <p className="uppercase text-sm text-gray-400 font-semibold mb-2">Public Playlist</p>
            <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>
            <p className="text-gray-300 text-lg mb-4">{playlist.description}</p>
            <p className="text-gray-400 text-sm">
              PlayLoud • {songs.length} song{songs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section>
        <div className="flex items-center gap-6">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="w-14 h-14 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Songs List */}
      <section>
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No songs in this playlist</h3>
            <p className="text-gray-500">Songs will appear here when they're added to the playlist.</p>
          </div>
        ) : (
          <div className="bg-black/20 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-gray-800 text-sm text-gray-400 font-medium">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Artist</div>
              <div>Album</div>
              <div>Duration</div>
              <div className="w-24">Actions</div>
            </div>

            {/* Songs */}
            <div className="divide-y divide-gray-800">
              {songs.map((song, index) => (
                <div
                  key={song.$id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  {/* Track Number / Play Button */}
                  <div className="w-8 flex items-center">
                    <span className="text-gray-400 text-sm group-hover:hidden">
                      {index + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                      className="hidden group-hover:flex w-8 h-8 bg-green-500 rounded-full items-center justify-center hover:scale-110 transition-transform"
                    >
                      <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Title & Cover */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40/4a5568/ffffff?text=♪';
                      }}
                    />
                    <div>
                      <p className="text-white font-medium text-sm hover:underline cursor-pointer">
                        {song.title}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm hover:text-white hover:underline cursor-pointer">
                      {song.artist}
                    </p>
                  </div>

                  {/* Album */}
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm hover:text-white hover:underline cursor-pointer truncate">
                      {song.album}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">
                      {formatDuration(song.duration)}
                    </span>
                  </div>

                  {/* Actions (Like & Add to Playlist) */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Like Button */}
                    <button
                      onClick={(e) => handleToggleLike(e, song.$id)}
                      className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                      title={likedSongs.has(song.$id) ? "Unlike" : "Like"}
                    >
                      {likedSongs.has(song.$id) ? (
                        <HeartSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartOutline className="w-5 h-5 text-gray-400 hover:text-white" />
                      )}
                    </button>
                    
                    {/* Add to Playlist Button */}
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
                      
                      {/* Playlist Menu */}
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
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PlaylistPage;