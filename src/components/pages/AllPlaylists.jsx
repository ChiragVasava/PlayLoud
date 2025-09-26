// components/pages/AllPlaylists.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlayIcon, EllipsisHorizontalIcon, HeartIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

const AllPlaylists = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data - replace with actual data from your backend/state management
  const [userPlaylists, setUserPlaylists] = useState([
    {
      id: 1,
      name: 'My Favorites',
      songs: 45,
      isPublic: true,
      createdAt: '2024-01-15',
      lastPlayed: '2024-09-20',
      coverImage: null,
      description: 'My all-time favorite songs',
      duration: '2h 34m'
    },
    {
      id: 2,
      name: 'Workout Mix',
      songs: 32,
      isPublic: false,
      createdAt: '2024-02-10',
      lastPlayed: '2024-09-22',
      coverImage: null,
      description: 'High energy songs for gym sessions',
      duration: '1h 47m'
    },
    {
      id: 3,
      name: 'Chill Vibes',
      songs: 28,
      isPublic: true,
      createdAt: '2024-03-05',
      lastPlayed: '2024-09-18',
      coverImage: null,
      description: 'Relaxing music for peaceful moments',
      duration: '1h 52m'
    },
    {
      id: 4,
      name: 'Road Trip Hits',
      songs: 67,
      isPublic: false,
      createdAt: '2024-01-28',
      lastPlayed: '2024-09-15',
      coverImage: null,
      description: 'Perfect songs for long drives',
      duration: '3h 21m'
    },
    {
      id: 5,
      name: 'Study Focus',
      songs: 23,
      isPublic: true,
      createdAt: '2024-04-12',
      lastPlayed: '2024-09-21',
      coverImage: null,
      description: 'Instrumental and ambient tracks',
      duration: '1h 15m'
    },
    {
      id: 6,
      name: 'Party Anthems',
      songs: 41,
      isPublic: false,
      createdAt: '2024-02-22',
      lastPlayed: '2024-09-19',
      coverImage: null,
      description: 'Get the party started with these bangers',
      duration: '2h 8m'
    }
  ]);

  // Filter and sort playlists
  const filteredPlaylists = userPlaylists
    .filter(playlist => {
      const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           playlist.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'public' && playlist.isPublic) ||
                           (selectedFilter === 'private' && !playlist.isPublic);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastPlayed) - new Date(a.lastPlayed);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'songs':
          return b.songs - a.songs;
        default:
          return 0;
      }
    });

  const handlePlayPlaylist = (playlistId) => {
    console.log('Playing playlist:', playlistId);
    // Add your play logic here
  };

  const handleEditPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}/edit`);
  };

  const handleDeletePlaylist = (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
    }
  };

  const PlaylistCard = ({ playlist }) => (
    <div className="group bg-gray-800/40 hover:bg-gray-800/60 rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700/50 hover:border-gray-600/50">
      <div className="relative mb-4">
        {/* Playlist Cover */}
        <div 
          className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 overflow-hidden"
          onClick={() => navigate(`/playlist/${playlist.id}`)}
        >
          {playlist.coverImage ? (
            <img 
              src={playlist.coverImage} 
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPlaylist(playlist.id);
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
            onClick={() => navigate(`/playlist/${playlist.id}`)}
          >
            {playlist.name}
          </h3>
          
          {/* Options Menu */}
          <div className="relative group/menu">
            <button className="text-gray-400 hover:text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 min-w-48 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
              <button
                onClick={() => handlePlayPlaylist(playlist.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Play
              </button>
              <button
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                View Playlist
              </button>
              <button
                onClick={() => handleEditPlaylist(playlist.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Edit Details
              </button>
              <hr className="border-gray-700 my-1" />
              <button
                onClick={() => handleDeletePlaylist(playlist.id)}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2">
          {playlist.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{playlist.songs} songs</span>
          <span>{playlist.duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${playlist.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/50 text-gray-400'}`}>
              {playlist.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Last played {new Date(playlist.lastPlayed).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Playlists</h1>
            <p className="text-gray-400">
              {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''} • 
              {userPlaylists.reduce((total, playlist) => total + playlist.songs, 0)} total songs
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/create-playlist')}
            variant="primary"
            size="medium"
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Playlist</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
              <option value="recent">Recently Played</option>
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
            <PlaylistCard key={playlist.id} playlist={playlist} />
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
              onClick={() => navigate('/create-playlist')}
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
                {userPlaylists.reduce((total, playlist) => total + playlist.songs, 0)}
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

export default AllPlaylists;