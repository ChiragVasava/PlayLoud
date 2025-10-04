// components/profile/ProfilePage.jsx (UPDATED - REAL COUNTS + REAL PLAYLISTS)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { account } from '../../lib/appwrite';
import appwriteAuth from '../../utils/appwriteAuth';
import { databases, APPWRITE_CONFIG, Query } from '../../lib/appwrite';

import {
  CameraIcon,
  PencilIcon,
  HeartIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  MusicalNoteIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ProfilePage = ({ onNavigate }) => {
  const navigate = useNavigate();
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);

  // User + profile data
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    joinDate: '',
    totalPlaylists: 0,
    totalLikedSongs: 0
  });

  // Real user playlists
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Mock recently played (you can wire to `recently_played` later)
  const recentlyPlayed = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53' },
    { id: 3, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' }
  ];

  // Fetch user + counts + playlists
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1) Get current user
        const currentUser = await appwriteAuth.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // 2) Base profile meta
        const baseProfile = {
          username: currentUser.displayName || currentUser.name || 'User',
          email: currentUser.email,
          avatar: currentUser.avatar || appwriteAuth.generateInitialsAvatar(currentUser.name || currentUser.email),
          joinDate: new Date(currentUser.registration).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        };

        // 3) Fetch user's playlists (also used for count)
        const plRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'playlists',
          [
            Query.equal('userId', currentUser.$id),
            Query.orderDesc('$updatedAt'),
            Query.limit(50)
          ]
        );
        setUserPlaylists(plRes.documents);
        const playlistsCount = plRes.total ?? plRes.documents.length;

        // 4) Fetch liked songs count
        const likedRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'liked_songs',
          [
            Query.equal('userId', currentUser.$id),
            Query.limit(1000) // simple approach for now
          ]
        );
        const likedCount = likedRes.total ?? likedRes.documents.length;

        // 5) Update profileData with real counts
        setProfileData(prev => ({
          ...baseProfile,
          totalPlaylists: playlistsCount,
          totalLikedSongs: likedCount
        }));
      } catch (err) {
        console.error('Failed loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setError(null);

      const result = await appwriteAuth.uploadProfilePicture(file, user.$id);
      if (result.success) {
        setProfileData(prev => ({ ...prev, avatar: result.avatarUrl }));
        const updatedUser = await appwriteAuth.getCurrentUser();
        setUser(updatedUser);
      } else {
        setError(result.error || 'Failed to upload avatar');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save name display changes
  const handleSaveProfile = async () => {
    try {
      setError(null);
      await account.updateName(profileData.username);
      await account.updatePrefs({
        ...user.prefs,
        displayName: profileData.username
      });
      setIsEditing(false);
      const updatedUser = await appwriteAuth.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Navigation helpers
  const handleNavigateTo = (key, payload) => {
    if (onNavigate) return onNavigate(key, payload);
    switch (key) {
      case 'likedSongs': navigate('/liked-songs'); break;
      case 'recentlyPlayed': navigate('/recently-played'); break;
      case 'createPlaylist': navigate('/create-playlist'); break;
      case 'allPlaylists': navigate('/all-playlists'); break;
      case 'library': navigate('/library'); break;
      case 'playlist': navigate(`/playlist/${payload?.id}`); break;
      case 'song': navigate(`/song/${encodeURIComponent(payload?.name)}`, { state: payload }); break;
      default: break;
    }
  };

  // UI states
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

          {/* Info + Actions */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              <span className="text-black text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
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
              <button onClick={() => handleNavigateTo('allPlaylists')} className="hover:text-green-300 transition-colors">
                <strong>{profileData.totalPlaylists}</strong> Playlists
              </button>
              <button onClick={() => handleNavigateTo('likedSongs')} className="hover:text-green-300 transition-colors">
                <strong>{profileData.totalLikedSongs.toLocaleString()}</strong> Liked Songs
              </button>
            </div>
          </div>

          {/* Edit Buttons */}
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button onClick={handleSaveProfile} variant="primary" size="medium" className="bg-green-500 hover:bg-green-600">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setProfileData(prev => ({ ...prev, username: user.displayName || user.name || 'User' }));
                  }}
                  variant="secondary"
                  size="medium"
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="medium" className="flex items-center bg-white/20 hover:bg_white/30 text-white">
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Playlists (REAL) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
            <div className="flex space-x-3">
              <button onClick={() => handleNavigateTo('allPlaylists')} className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center">
                View All
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
              </button>
              <button onClick={() => handleNavigateTo('createPlaylist')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Create Playlist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userPlaylists.length === 0 ? (
              <div className="text-gray-400 text-sm">No playlists yet.</div>
            ) : (
              userPlaylists.slice(0, 6).map((playlist) => (
                <div
                  key={playlist.$id}
                  onClick={() => handleNavigateTo('playlist', { id: playlist.$id, name: playlist.name })}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={playlist.coverImage || 'https://via.placeholder.com/64/4a5568/ffffff?text=♪'}
                        alt={playlist.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-green-300 transition-colors">{playlist.name}</h3>
                      <p className="text-sm text-gray-400">
                        {(playlist.songCount || 0)} songs • {playlist.isPublic ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <button className="p-2 hover:bg-gray-600 rounded-full transition-colors">
                      <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Liked Songs */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text_white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Liked Songs</h3>
                <p className="text-sm text-gray-400">{profileData.totalLikedSongs.toLocaleString()} songs</p>
              </div>
            </div>
            <button onClick={() => handleNavigateTo('likedSongs')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors">
              View All
            </button>
          </div>

          {/* Recently Played (mock) */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Recently Played</h3>
            <div className="space-y-3">
              {recentlyPlayed.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleNavigateTo('song', { name: track.title, artist: track.artist })}
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
            <button onClick={() => handleNavigateTo('recentlyPlayed')} className="w-full mt-4 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              Show More
            </button>
          </div>

          {/* Account Quick Stats */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Member since</span>
                <span className="text-white">{profileData.joinDate}</span>
              </div>
              <div className="flex justify_between">
                <span className="text-gray-400">Account type</span>
                <span className="text-white">{user?.emailVerification ? 'Verified' : 'Unverified'}</span>
              </div>
              <div className="flex justify_between">
                <span className="text-gray-400">Provider</span>
                <span className="text-white">{user?.provider === 'google' ? 'Google' : 'Email'}</span>
              </div>
              <div className="flex justify_between">
                <span className="text-gray-400">User ID</span>
                <span className="text-white text-xs font-mono truncate">{user?.$id ? user.$id.substring(0, 8) + '...' : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;