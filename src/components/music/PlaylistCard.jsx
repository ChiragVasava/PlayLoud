// components/music/PlaylistCard.jsx
import React from 'react';
import { PlayIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';

const PlaylistCard = ({ playlist = {}, onPlay, onNavigate, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-32',
    medium: 'w-48',
    large: 'w-64'
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay(playlist);
  };

  const handleClick = () => {
    onNavigate('playlist', { id: playlist.id, name: playlist.name });
  };

  return (
    <div
      onClick={handleClick}
      className={`${sizeClasses[size]} bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-all duration-200 cursor-pointer group`}
    >
      {/* Cover Image */}
      <div className="relative mb-4">
        <img
          src={playlist.cover || '/api/placeholder/200/200'}
          alt={playlist.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <PlayIcon className="w-6 h-6 text-white ml-0.5" />
          </button>
        </div>

        {/* Playlist Type Badge */}
        {playlist.type && (
          <div className="absolute top-2 left-2">
            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
              {playlist.type}
            </span>
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-white truncate group-hover:text-green-400 transition-colors">
          {playlist.title}
        </h3>

        {playlist.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {playlist.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {playlist.songCount && (
              <span>{playlist.songCount} songs</span>
            )}
            {playlist.duration && (
              <span>{playlist.duration}</span>
            )}
          </div>

          {playlist.isPublic !== undefined && (
            <div className="flex items-center space-x-1">
              {playlist.isPublic ? (
                <UserIcon className="w-3 h-3" />
              ) : (
                <HeartIcon className="w-3 h-3" />
              )}
              <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        {playlist.creator && (
          <div className="flex items-center space-x-2 mt-2">
            <img
              src={playlist.creator.avatar || '/api/placeholder/24/24'}
              alt={playlist.creator.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-400 truncate">
              By {playlist.creator.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;