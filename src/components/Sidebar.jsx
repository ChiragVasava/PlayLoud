// components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

const Sidebar = ({ onSidebarToggle }) => {
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([
    { id: 1, name: 'My Favorites', songs: 45, isPublic: true },
    { id: 2, name: 'Workout Mix', songs: 32, isPublic: false },
    { id: 3, name: 'Chill Vibes', songs: 28, isPublic: true },
  ]);

  const handleCreatePlaylist = () => {
    navigate('/create-playlist');
    console.log('Navigating to Create Playlist page...');
  }

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handlePlaylistCreate = (playlistName) => {
    const newPlaylist = {
      id: userPlaylists.length + 1,
      name: playlistName,
      songs: 0,
      isPublic: false
    };
    setUserPlaylists([...userPlaylists, newPlaylist]);
    setShowCreateModal(false);
    console.log('Created playlist:', playlistName);
  };

  const toggleSidebar = () => {
    const newExpandedState = !isSidebarExpanded;
    setIsSidebarExpanded(newExpandedState);
    // Notify parent component about sidebar state change
    if (onSidebarToggle) {
      onSidebarToggle(newExpandedState);
    }
  };

  const handleShowMore = (section) => {
    if (section === 'recent') {
      navigate('/recently-played');
    } else if (section === 'playlists') {
      navigate('/library');
    }
    console.log('Navigating to:', section);
  };

  const iconNavItems = [
    {
      id: 'Expand',
      label: isSidebarExpanded ? 'Collapse' : 'Expand',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isSidebarExpanded ? 'rotate-180' : 'rotate-0'
            }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      ),
      action: toggleSidebar
    },
    {
      id: 'library',
      label: 'Your Library',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
        </svg>
      ),
      action: () => navigate('/library')
    },
    {
      id: 'create',
      label: 'Create Playlist',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: handleCreatePlaylist
    },
    {
      id: 'liked',
      label: 'Liked Songs',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      action: () => navigate('/liked-songs')
    },
    {
      id: 'recent',
      label: 'Recently Played',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
        </svg>
      ),
      action: () => navigate('/recently-played')
    }
  ];

  return (
    <>
      {/* Desktop Sidebar - Compact */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:top-12 lg:bottom-0 lg:left-0 lg:z-40 bg-gradient-to-b from-gray-900 to-black border-r border-gray-700">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Your Library Header - Compact */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                </svg>
                Your Library
              </h2>
            </div>

            {/* Quick Actions - Compact */}
            <div className="flex space-x-1">
              <button
                onClick={() => navigate('/playlists')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                Playlists
              </button>
              <button
                onClick={() => navigate('/artists')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                Artists
              </button>
            </div>
          </div>

          {/* Create Playlist & Liked Songs & Recently Played - Compact */}
          <div className="p-4 space-y-0.5">
            <button
              onClick={() => navigate('/create-playlist')}
              className="w-full"
            >
              <Button
                variant="primary"
                size="medium"
                className="w-full flex justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </button>

            <button
              onClick={() => navigate('/liked-songs')}
              className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Liked Songs</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">
                1,247
              </span>
            </button>

            <button
              onClick={() => navigate('/recently-played')}
              className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                </div>
                <span className="font-medium text-sm">Recently Played</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">
                1,247
              </span>
            </button>
          </div>

          {/* User Playlists  */}
          <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Your Playlists
              </h3>
              <button
                onClick={() => handleShowMore('playlists')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Show more
              </button>
            </div>

            {/* Display User's Playlist Here */}
            <div className="space-y-1">
              {userPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`, { state: { id: playlist.id, name: playlist.name } })}
                  className="w-full flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-xs truncate">{playlist.name}</p>
                    <p className="text-xs text-gray-500">
                      {playlist.songs} songs
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar - Now responsive width */}
      <aside
        className={`lg:hidden fixed top-12 bottom-0 left-0 z-40 bg-gradient-to-b from-gray-900 to-black border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-64' : 'w-12'
          }`}
      >
        {/* Toggle Button */}
        <div className="p-2 border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isSidebarExpanded ? 'rotate-180' : 'rotate-0'
                }`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Collapsed State - Icon Navigation */}
        {!isSidebarExpanded && (
          <div className="flex-1 p-2 space-y-3">
            {iconNavItems.slice(1).map((item) => ( // Skip the first Expand item
              <div key={item.id} className="relative group">
                <button
                  onClick={item.action}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  {item.icon}
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-gray-600">
                  {item.label}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isSidebarExpanded && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                  </svg>
                  Your Library
                </h2>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => navigate('/playlists')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  Playlists
                </button>
                <button
                  onClick={() => navigate('/artists')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  Artists
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => navigate('/create-playlist')}
                className="w-full"
              >
                <Button
                  variant="primary"
                  size="medium"
                  className="w-full flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Playlist
                </Button>
              </button>

              {/* Liked Songs */}
              <button
                onClick={() => navigate('/liked-songs')}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">Liked Songs</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">
                  1,247
                </span>
              </button>

              <button
                onClick={() => navigate('/recently-played')}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </div>
                  <span className="font-medium text-sm">Recently Played</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">
                  1,247
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Your Playlists
                </h3>
                <button
                  onClick={() => handleShowMore('playlists')}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Show more
                </button>
              </div>

              <div className="space-y-1">
                {userPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => navigate(`/playlist/${playlist.id}`, { state: { id: playlist.id, name: playlist.name } })}
                    className="w-full flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-medium text-xs truncate">{playlist.name}</p>
                      <p className="text-xs text-gray-500">
                        {playlist.songs} songs
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </aside>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
              onClick={handleModalClose}
            ></div>

            <div className="inline-block align-bottom bg-gray-900 rounded-xl px-4 pt-4 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-5 border border-gray-700">
              <div>
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 mb-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-lg leading-6 font-bold text-white mb-2">
                    Create New Playlist
                  </h3>
                  <p className="text-gray-400 mb-3 text-sm">Give your playlist a name</p>
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Enter playlist name..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handlePlaylistCreate(e.target.value.trim());
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center rounded-lg border border-gray-600 shadow-sm px-3 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none transition-colors"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center rounded-lg border border-transparent shadow-sm px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-sm font-medium text-white hover:from-green-600 hover:to-blue-600 focus:outline-none transition-all"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter playlist name..."]');
                    if (input && input.value.trim()) {
                      handlePlaylistCreate(input.value.trim());
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;