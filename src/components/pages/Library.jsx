// components/pages/Library.jsx (REAL DATA FROM APPWRITE)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG, Query } from '../../lib/appwrite';
import {
  PlusIcon,
  HeartIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PlayIcon,
  UserGroupIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const Library = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [likedSongsCount, setLikedSongsCount] = useState(0);

  // Get current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('playloud_user'));
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Fetch user's playlists
  useEffect(() => {
    const loadLibrary = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's playlists
        const playlistsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'playlists',
          [
            Query.equal('userId', currentUser.$id),
            Query.orderDesc('$updatedAt'),
            Query.limit(50)
          ]
        );

        setUserPlaylists(playlistsResponse.documents);
        console.log(`✅ Loaded ${playlistsResponse.documents.length} playlists`);

        // Fetch liked songs count
        try {
          const likedResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            'liked_songs',
            [
              Query.equal('userId', currentUser.$id),
              Query.limit(1000)
            ]
          );
          setLikedSongsCount(likedResponse.total || likedResponse.documents.length);
        } catch (likedError) {
          console.error('Error fetching liked songs count:', likedError);
        }

      } catch (error) {
        console.error('Error loading library:', error);
        setError('Failed to load library');
      } finally {
        setIsLoading(false);
      }
    };

    loadLibrary();
  }, [currentUser]);

  // Filter and sort playlists
  const filteredPlaylists = userPlaylists
    .filter(playlist => {
      const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'public' && playlist.isPublic) ||
        (selectedFilter === 'private' && !playlist.isPublic);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.$updatedAt) - new Date(a.$updatedAt);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.$createdAt) - new Date(a.$createdAt);
        case 'songs':
          return (b.songCount || 0) - (a.songCount || 0);
        default:
          return 0;
      }
    });

  const handlePlayPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    navigate('/create-playlist');
  };

  // const formatDuration = (seconds) => {
  //   if (!seconds) return "0m";
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m`;
  //   }
  //   return `${minutes}m`;
  // };

  const PlaylistCard = ({ playlist }) => (
    <div className="group bg-gray-800/40 hover:bg-gray-800/60 rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700/50 hover:border-gray-600/50">
      <div className="relative mb-4">
        {/* Playlist Cover */}
        <div
          className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 overflow-hidden"
          onClick={() => handlePlayPlaylist(playlist.$id)}
        >
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-12 h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPlaylist(playlist.$id);
          }}
          className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110"
        >
          <PlayIcon className="w-6 h-6 text-black ml-1" />
        </button>
      </div>

      {/* Playlist Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3
            className="font-bold text-white text-lg truncate cursor-pointer hover:underline"
            onClick={() => handlePlayPlaylist(playlist.$id)}
          >
            {playlist.name}
          </h3>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2">
          {playlist.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* <span>{playlist.songCount || 0} songs</span> */}
          {/* {playlist.totalDuration && <span>{formatDuration(playlist.totalDuration)}</span>} */}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full flex items-center space-x-1 ${playlist.isPublic
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-600/50 text-gray-400'
              }`}>
              {playlist.isPublic ? (
                <UserGroupIcon className="w-3 h-3" />
              ) : (
                <LockClosedIcon className="w-3 h-3" />
              )}
              <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your library...</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Library</h1>
          <p className="text-gray-400">
            {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Button
          onClick={handleCreatePlaylist}
          variant="primary"
          size="medium"
          className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Playlist</span>
        </Button>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liked Songs */}
        <div
          onClick={() => navigate('/liked-songs')}
          className="bg-gray-800/40 hover:bg-gray-800/60 p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 group border border-gray-700/50 hover:border-gray-600/50"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Liked Songs</h3>
              <p className="text-gray-400">{likedSongsCount} songs</p>
            </div>
          </div>
        </div>

        {/* Recently Played */}
        <div
          onClick={() => navigate('/recently-played')}
          className="bg-gray-800/40 hover:bg-gray-800/60 p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 group border border-gray-700/50 hover:border-gray-600/50"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Recently Played</h3>
              <p className="text-gray-400">Your listening history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          <button
            onClick={() => navigate('/all-playlists')}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Playlists</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="recent">Recently Updated</option>
              <option value="alphabetical">A-Z</option>
              <option value="created">Recently Created</option>
              <option value="songs">Most Songs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      {filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.$id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm ? 'No playlists found' : 'No playlists yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Create your first playlist to get started'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={handleCreatePlaylist}
              variant="primary"
              size="medium"
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full"
            >
              Create Your First Playlist
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {filteredPlaylists.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-400">{userPlaylists.length}</h3>
              <p className="text-gray-400">Total Playlists</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-400">
                {userPlaylists.reduce((total, playlist) => total + (playlist.songCount || 0), 0)}
              </h3>
              <p className="text-gray-400">Total Songs</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-purple-400">
                {userPlaylists.filter(p => p.isPublic).length}
              </h3>
              <p className="text-gray-400">Public Playlists</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-pink-400">
                {userPlaylists.filter(p => !p.isPublic).length}
              </h3>
              <p className="text-gray-400">Private Playlists</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;