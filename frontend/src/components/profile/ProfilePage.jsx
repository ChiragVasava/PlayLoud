// components/profile/ProfilePage.jsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

import {
  CameraIcon,
  PencilIcon,
  HeartIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

const ProfilePage = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'John Doe',
    email: 'john.doe@email.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    joinDate: 'January 2023',
    totalPlaylists: 12,
    totalLikedSongs: 1247,
    followersCount: 324,
    followingCount: 156
  });

  const userPlaylists = [
    { id: 1, name: 'My Favorites', songs: 45, cover: '/api/placeholder/80/80', isPublic: true },
    { id: 2, name: 'Workout Mix', songs: 32, cover: '/api/placeholder/80/80', isPublic: false },
    { id: 3, name: 'Chill Vibes', songs: 28, cover: '/api/placeholder/80/80', isPublic: true },
    { id: 4, name: 'Road Trip', songs: 67, cover: '/api/placeholder/80/80', isPublic: false }
  ];

  const recentlyPlayed = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53' },
    { id: 3, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' }
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={profileData.avatar}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <CameraIcon className="w-8 h-8 text-black" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full text-black">
                Profile
              </span>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className="text-4xl font-bold bg-transparent border-b-2 border-white outline-none mb-2"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-2">{profileData.username}</h1>
            )}

            <p className="text-xl opacity-90 mb-4">{profileData.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <span><strong>{profileData.totalPlaylists}</strong> Playlists</span>
              <span><strong>{profileData.totalLikedSongs.toLocaleString()}</strong> Liked Songs</span>
              <span><strong>{profileData.followersCount}</strong> Followers</span>
              <span><strong>{profileData.followingCount}</strong> Following</span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex space-x-3">
            {/* {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button> */}
            {isEditing ? (
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  size="medium"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                  size="medium"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="medium"
                className='flex items-center bg-white text-black hover:text-white'
              >
                <PencilIcon className="w-4 h-4 mr-2 text-black" />
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
            <button
              onClick={() => onNavigate('createPlaylist')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Playlist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => onNavigate('playlist', { id: playlist.id, name: playlist.name })}
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
                    <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.songs} songs • {playlist.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-600 rounded-full transition-colors">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
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
              onClick={() => onNavigate('likedSongs')}
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
                <div key={track.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                    <MusicalNoteIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs text-gray-500">{track.duration}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('recentlyPlayed')}
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
                <span className="text-gray-400">Total listening time</span>
                <span className="text-white">156 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Top genre</span>
                <span className="text-white">Pop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;