// components/profile/ProfilePage.jsx (COMPLETE FIXED VERSION)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { account, storage, ID, BUCKET_ID } from '../../lib/appwrite';
import appwriteAuth from '../../utils/appwriteAuth';

import {
  CameraIcon,
  PencilIcon,
  HeartIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  MusicalNoteIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const ProfilePage = ({ onNavigate }) => {
  const navigate = useNavigate();
  
  // State management for editing, loading, and user data
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Profile data state with default values
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    joinDate: '',
    totalPlaylists: 0,
    totalLikedSongs: 0,
    followersCount: 0,
    followingCount: 0
  });

  // Mock data for playlists (replace with real data later)
  const userPlaylists = [
    { id: 1, name: 'My Favorites', songs: 45, cover: '/api/placeholder/80/80', isPublic: true },
    { id: 2, name: 'Workout Mix', songs: 32, cover: '/api/placeholder/80/80', isPublic: false },
    { id: 3, name: 'Chill Vibes', songs: 28, cover: '/api/placeholder/80/80', isPublic: true },
    { id: 4, name: 'Road Trip', songs: 67, cover: '/api/placeholder/80/80', isPublic: false }
  ];

  // Mock recently played data
  const recentlyPlayed = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53' },
    { id: 3, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' }
  ];

  // Fetch user data from Appwrite on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user using the appwriteAuth service
        const currentUser = await appwriteAuth.getCurrentUser();
        if (!currentUser) {
          setError('User not found');
          navigate('/login');
          return;
        }

        setUser(currentUser);

        // Extract user information
        const userData = {
          username: currentUser.displayName || currentUser.name || 'User',
          email: currentUser.email,
          avatar: currentUser.avatar || appwriteAuth.generateInitialsAvatar(currentUser.name || currentUser.email),
          joinDate: new Date(currentUser.registration).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          totalPlaylists: 12, // Replace with actual count from database
          totalLikedSongs: 1247, // Replace with actual count
          followersCount: 324, // Replace with actual count
          followingCount: 156 // Replace with actual count
        };

        setProfileData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle avatar upload using appwriteAuth service
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Use the appwriteAuth service to upload profile picture
      const result = await appwriteAuth.uploadProfilePicture(file, user.$id);
      
      if (result.success) {
        // Update local state
        setProfileData(prev => ({
          ...prev,
          avatar: result.avatarUrl
        }));

        // Refresh user data
        const updatedUser = await appwriteAuth.getCurrentUser();
        setUser(updatedUser);
        
        console.log('Profile picture updated successfully');
      } else {
        setError(result.error);
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save profile changes to Appwrite
  const handleSaveProfile = async () => {
    try {
      setError(null);

      // Update user name in Appwrite
      await account.updateName(profileData.username);

      // Update user preferences
      await account.updatePrefs({
        ...user.prefs,
        displayName: profileData.username
      });

      setIsEditing(false);

      // Refresh user data
      const updatedUser = await appwriteAuth.getCurrentUser();
      setUser(updatedUser);

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Navigation handlers
  const handleNavigateToLikedSongs = () => {
    if (onNavigate) {
      onNavigate('likedSongs');
    } else {
      navigate('/liked-songs');
    }
  };

  const handleNavigateToRecentlyPlayed = () => {
    if (onNavigate) {
      onNavigate('recentlyPlayed');
    } else {
      navigate('/recently-played');
    }
  };

  const handleNavigateToCreatePlaylist = () => {
    if (onNavigate) {
      onNavigate('createPlaylist');
    } else {
      navigate('/create-playlist');
    }
  };

  const handleNavigateToPlaylist = (playlist) => {
    if (onNavigate) {
      onNavigate('playlist', { id: playlist.id, name: playlist.name });
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  const handleNavigateToSong = (track) => {
    if (onNavigate) {
      onNavigate('song', { name: track.title, artist: track.artist });
    } else {
      navigate(`/song/${encodeURIComponent(track.title)}`, { 
        state: { name: track.title, artist: track.artist } 
      });
    }
  };

  const handleNavigateToLibrary = () => {
    if (onNavigate) {
      onNavigate('library');
    } else {
      navigate('/library');
    }
  };

  const handleNavigateToAllPlaylists = () => {
    if (onNavigate) {
      onNavigate('allPlaylists');
    } else {
      navigate('/all-playlists');
    }
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error && !user) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Error message display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={profileData.avatar}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = appwriteAuth.generateInitialsAvatar(profileData.username || profileData.email);
              }}
            />
            <label className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${isUploadingAvatar ? 'opacity-100' : ''}`}>
              {isUploadingAvatar ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <CameraIcon className="w-8 h-8 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Profile
              </span>
              {user && user.emailVerification && (
                <span className="text-sm font-medium bg-green-500 bg-opacity-90 px-3 py-1 rounded-full">
                  Verified
                </span>
              )}
              {user && user.provider === 'google' && (
                <span className="text-sm font-medium bg-blue-500 bg-opacity-90 px-3 py-1 rounded-full">
                  Google Account
                </span>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className="text-4xl font-bold bg-transparent border-b-2 border-white outline-none mb-2 text-white placeholder-white/70"
                placeholder="Enter your name"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-2">{profileData.username}</h1>
            )}

            <p className="text-xl opacity-90 mb-4">{profileData.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <button 
                onClick={handleNavigateToAllPlaylists}
                className="hover:text-green-300 transition-colors"
              >
                <strong>{profileData.totalPlaylists}</strong> Playlists
              </button>
              <button 
                onClick={handleNavigateToLikedSongs}
                className="hover:text-green-300 transition-colors"
              >
                <strong>{profileData.totalLikedSongs.toLocaleString()}</strong> Liked Songs
              </button>
              <span><strong>{profileData.followersCount}</strong> Followers</span>
              <span><strong>{profileData.followingCount}</strong> Following</span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex space-x-3">
            {isEditing ? (
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  size="medium"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    // Reset profileData to original values
                    setProfileData(prev => ({
                      ...prev,
                      username: user.displayName || user.name || 'User'
                    }));
                  }}
                  variant="secondary"
                  size="medium"
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="medium"
                className='flex items-center bg-white/20 hover:bg-white/30 text-white'
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Playlists */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleNavigateToAllPlaylists}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center"
              >
                View All
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={handleNavigateToCreatePlaylist}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Playlist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => handleNavigateToPlaylist(playlist)}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-green-300 transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {playlist.songs} songs • {playlist.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add playlist options menu functionality
                    }}
                    className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleNavigateToLibrary}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-green-300 transition-colors">
                      Your Library
                    </h4>
                    <p className="text-sm text-gray-400">View all your music</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleNavigateToCreatePlaylist}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-green-300 transition-colors">
                      Create Playlist
                    </h4>
                    <p className="text-sm text-gray-400">Start a new collection</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Liked Songs */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Liked Songs</h3>
                <p className="text-sm text-gray-400">{profileData.totalLikedSongs.toLocaleString()} songs</p>
              </div>
            </div>
            <button
              onClick={handleNavigateToLikedSongs}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              View All
            </button>
          </div>

          {/* Recently Played */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Recently Played</h3>
            <div className="space-y-3">
              {recentlyPlayed.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleNavigateToSong(track)}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                    <MusicalNoteIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate group-hover:text-green-300 transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs text-gray-500">{track.duration}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleNavigateToRecentlyPlayed}
              className="w-full mt-4 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              Show More
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Member since</span>
                <span className="text-white">{profileData.joinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account type</span>
                <span className="text-white">
                  {user && user.emailVerification ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Provider</span>
                <span className="text-white">
                  {user && user.provider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span className="text-white text-xs font-mono truncate">
                  {user && user.$id ? user.$id.substring(0, 8) + '...' : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Settings
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Privacy
              </button>
              <button
                onClick={() => navigate('/help')}
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Help & Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;