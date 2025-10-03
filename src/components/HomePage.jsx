// components/HomePage.jsx (SIMPLIFIED VERSION)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/useMusic';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { Query } from 'appwrite';

const HomePage = () => {
  const navigate = useNavigate();
  const { playSong } = useMusic(); // Removed playPlaylist since no queue
  const [defaultPlaylists, setDefaultPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDefaultPlaylists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading public playlists...');

        // 🎵 Fetch public playlists (default playlists for all users)
        const playlistsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'playlists',
          [
            Query.equal('isPublic', true),
            Query.equal('userId', 'system'), // Only system playlists
            Query.limit(8)
          ]
        );

        console.log(`Successfully loaded ${playlistsResponse.documents.length} playlists`);

        // Transform playlists data
        const transformedPlaylists = playlistsResponse.documents.map(playlist => ({
          $id: playlist.$id,
          name: playlist.name,
          description: playlist.description,
          coverImage: playlist.coverImage
        }));

        setDefaultPlaylists(transformedPlaylists);

      } catch (error) {
        console.error('Error loading playlists:', error);
        console.error('Error details:', {
          message: error?.message,
          type: error?.type,
          code: error?.code,
          status: error?.status,
          stack: error?.stack
        });

        // Handle different error types for public access
        if (error?.code === 403) {
          console.log('Permission error - playlists collection may not be publicly readable');
          setError('Playlists are not accessible. Please check database permissions.');
        } else if (error?.code === 404) {
          console.log('Collection not found - check if playlists collection exists');
          setError('Playlists collection not found. Please check your database setup.');
        } else if (error?.code >= 500) {
          console.log('Server error detected');
          setError('Server error. Please try again later.');
        } else {
          console.log('General error loading playlists');
          setError('Failed to load playlists. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultPlaylists();
  }, []);

  const handlePlaylistClick = (playlist) => {
    // Navigate to PlaylistPage with playlist data
    navigate(`/playlist/${playlist.$id}`, {
      state: {
        id: playlist.$id,
        name: playlist.name,
        description: playlist.description,
        coverImage: playlist.coverImage
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-sm text-gray-400">Having trouble loading playlists</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
              >
                Browse Music
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Playlists</h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Show all
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {defaultPlaylists.map((playlist) => (
            <div
              key={playlist.$id}
              onClick={() => handlePlaylistClick(playlist)}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 group cursor-pointer transform hover:scale-105"
            >
              <div className="relative mb-4">
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300/4a5568/ffffff?text=♪';
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaylistClick(playlist);
                    }}
                    className="w-12 h-12 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors cursor-pointer truncate">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{playlist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/liked-songs')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all duration-300 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Liked Songs</h3>
                <p className="text-purple-200 text-sm">Your favorites</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/create-playlist')}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-300 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Create Playlist</h3>
                <p className="text-green-200 text-sm">Start fresh</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/browse')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Browse Music</h3>
                <p className="text-blue-200 text-sm">Discover new</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-br from-yellow-600 to-orange-600 p-6 rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Go Premium</h3>
                <p className="text-yellow-200 text-sm">Ad-free music</p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;