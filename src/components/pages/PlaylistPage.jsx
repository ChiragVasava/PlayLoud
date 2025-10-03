// components/pages/PlaylistPage.jsx (FIXED)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useMusic } from '../../context/useMusic';

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useMusic();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
            Query.orderAsc('order') // ✅ Fixed: Using 'order' instead of 'position'
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
            
            // ✅ Construct proper song object with audioUrl
            return {
              $id: songResponse.$id,
              title: songResponse.title,
              artist: songResponse.artist,
              album: songResponse.album,
              genre: songResponse.genre,
              duration: songResponse.duration,
              coverImage: songResponse.coverImage,
              // ✅ Add audioUrl for playing
              audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${songResponse.fileId}/view?project=${APPWRITE_CONFIG.projectId}&mode=admin`,
              order: playlistSong.order, // ✅ Fixed: Using 'order' instead of 'position'
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
  }, [id]);

  const handlePlaySong = (song) => {
    console.log('Playing song:', song.title);
    playSong(song);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      console.log('Playing all songs, starting with:', songs[0].title);
      playSong(songs[0]);
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
          
          <button className="w-8 h-8 text-gray-400 hover:text-white transition-colors">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-800 text-sm text-gray-400 font-medium">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Artist</div>
              <div>Album</div>
              <div>Duration</div>
            </div>

            {/* Songs */}
            <div className="divide-y divide-gray-800">
              {songs.map((song, index) => (
                <div
                  key={song.$id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group cursor-pointer"
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