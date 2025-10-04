// components/pages/SearchPage.jsx (COMPLETE WITH LIKE & PLAYLIST FEATURES)
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG, Query, ID } from '../../lib/appwrite';
import { useMusic } from '../../context/useMusic';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playSong, setAllSongs } = useMusic();
  const query = searchParams.get('q') || '';
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
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

  // Fetch all songs and user's liked songs
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // ✅ Fetch ALL songs from Appwrite (using limit(100) to get more than default 25)
        const songsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'songs',
          [Query.limit(1000)] // Increase limit to fetch more songs
        );

        console.log(`✅ Fetched ${songsResponse.documents.length} songs from Appwrite`);

        // Process songs
        const allSongs = songsResponse.documents.map(song => ({
          $id: song.$id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          genre: song.genre,
          duration: song.duration,
          coverImage: song.coverImage,
          fileId: song.fileId,
          audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`
        }));
        
        // Update MusicContext with all songs
        setAllSongs(allSongs);
        
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
            console.log(`✅ User has ${likedIds.size} liked songs`);
          } catch (likedError) {
            console.error('Error fetching liked songs:', likedError);
          }
          
          // Fetch user playlists
          try {
            const playlistsResponse = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              'playlists',
              [Query.equal('userId', currentUser.$id), Query.limit(50)]
            );
            setUserPlaylists(playlistsResponse.documents);
            console.log(`✅ User has ${playlistsResponse.documents.length} playlists`);
          } catch (playlistError) {
            console.error('Error fetching user playlists:', playlistError);
          }
        }
        
        // Extract unique artists and genres
        const uniqueArtists = [...new Set(allSongs.map(song => song.artist))];
        const uniqueGenres = [...new Set(allSongs.filter(song => song.genre).map(song => song.genre))];
        
        // Filter results based on search query
        if (query) {
          const lowerQuery = query.toLowerCase();
          
          const filteredSongs = allSongs.filter(song => 
            (song.title && song.title.toLowerCase().includes(lowerQuery)) ||
            (song.artist && song.artist.toLowerCase().includes(lowerQuery)) ||
            (song.album && song.album.toLowerCase().includes(lowerQuery)) ||
            (song.genre && song.genre.toLowerCase().includes(lowerQuery))
          );
          
          const matchingArtists = uniqueArtists.filter(artist => 
            artist && artist.toLowerCase().includes(lowerQuery)
          );
          
          const matchingGenres = uniqueGenres.filter(genre => 
            genre && genre.toLowerCase().includes(lowerQuery)
          );
          
          setSongs(filteredSongs);
          setArtists(matchingArtists.map(name => ({ 
            name, 
            image: `/artists/${name.replace(/\s+/g, '_').replace(/[&,]/g, '').toLowerCase()}.jpg`, 
            songs: allSongs.filter(song => song.artist === name)
          })));
          setGenres(matchingGenres.map(name => ({
            name,
            songs: allSongs.filter(song => song.genre === name)
          })));
        } else {
          // No query, show all songs
          setSongs(allSongs);
          setArtists(uniqueArtists.map(name => ({ 
            name, 
            image: `/artists/${name.replace(/\s+/g, '_').replace(/[&,]/g, '').toLowerCase()}.jpg`, 
            songs: allSongs.filter(song => song.artist === name)
          })));
          setGenres(uniqueGenres.map(name => ({
            name,
            songs: allSongs.filter(song => song.genre === name)
          })));
        }
        
      } catch (error) {
        console.error('Error loading songs:', error);
        setError('Failed to load songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Close playlist menu when clicking outside
    const handleClickOutside = (event) => {
      if (showPlaylistMenu && !event.target.closest('.playlist-menu')) {
        setShowPlaylistMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    
  }, [query, setAllSongs, currentUser]);

  const handlePlaySong = (song) => {
    playSong(song);
  };

  const handleGenreClick = (genre) => {
    navigate(`/search?q=${encodeURIComponent(genre)}`);
  };

  const handleArtistClick = (artist) => {
    navigate(`/search?q=${encodeURIComponent(artist)}`);
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
        // Unlike: Find and delete the liked_songs document
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
          console.log('✅ Song unliked');
        }
        
      } else {
        // Like: Create new liked_songs document
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
        console.log('✅ Song liked');
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
      console.log('✅ Song added to playlist');
      
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
          <p className="text-gray-400">Loading all your music...</p>
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
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        {query ? (
          <h2 className="text-2xl font-bold mb-4">
            Results for: <span className="text-green-400">"{query}"</span>
          </h2>
        ) : (
          <h2 className="text-2xl font-bold mb-4">Browse Music</h2>
        )}
        
        <p className="text-gray-400 text-sm mb-4">
          {songs.length} song{songs.length !== 1 ? 's' : ''} • {artists.length} artist{artists.length !== 1 ? 's' : ''} • {genres.length} genre{genres.length !== 1 ? 's' : ''}
        </p>
        
        {songs.length === 0 && artists.length === 0 && genres.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 mb-4">No results found for "{query}"</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Browse All Music
            </button>
          </div>
        )}
      </div>

      {/* Genres Section */}
      {genres.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Genres</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <button
                key={genre.name}
                onClick={() => handleGenreClick(genre.name)}
                className="bg-gradient-to-br from-gray-800 to-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                {genre.name} <span className="text-gray-400">({genre.songs.length})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.map((artist) => (
              <div 
                key={artist.name} 
                className="text-center cursor-pointer group"
                onClick={() => handleArtistClick(artist.name)}
              >
                <div className="relative rounded-full overflow-hidden aspect-square mb-3 mx-auto">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=random&size=200`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h4 className="font-semibold text-sm group-hover:text-green-400 transition-colors">{artist.name}</h4>
                <p className="text-xs text-gray-400">{artist.songs.length} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Songs Section */}
      {songs.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Songs</h3>
          <div className="bg-gray-800/20 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-gray-700 text-sm text-gray-400 font-medium">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Artist</div>
              <div>Album</div>
              <div>Duration</div>
              <div className="w-24">Actions</div>
            </div>

            {/* Songs List */}
            <div className="divide-y divide-gray-700/50">
              {songs.map((song, index) => (
                <div
                  key={song.$id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-6 py-4 hover:bg-gray-700/30 transition-colors group cursor-pointer"
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
                    <p 
                      className="text-gray-400 text-sm hover:text-white hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtistClick(song.artist);
                      }}
                    >
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
                      
                      {/* Playlist Selection Menu */}
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
                                    {/* <p className="text-xs text-gray-400">{playlist.songCount || 0} songs</p> */}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-center text-gray-400 text-sm">
                              <p>You don't have any playlists yet</p>
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
        </section>
      )}
    </div>
  );
};

export default SearchPage;