// components/music/SongCard.jsx
import React, { useState } from 'react';
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const SongCard = ({ song = {}, isPlaying, onPlay, onPause, className = '' }) => {
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [showMenu, setShowMenu] = useState(false);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause(song);
    } else {
      onPlay(song);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    console.log(`${isLiked ? 'Unliked' : 'Liked'} song:`, song.title);
  };

  return (
    <div className={`group bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-all duration-200 cursor-pointer ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Album Cover */}
        <div className="relative flex-shrink-0">
          <img
            src={song.cover || '/api/placeholder/64/64'}
            alt={song.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <PauseIcon className="w-4 h-4 text-black" />
              ) : (
                <PlayIcon className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
            {song.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
          {song.album && (
            <p className="text-xs text-gray-500 truncate">{song.album}</p>
          )}
        </div>

        {/* Duration */}
        <div className="text-sm text-gray-400 hidden sm:block">
          {song.duration}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className="p-2 hover:bg-gray-600 rounded-full transition-colors"
          >
            {isLiked ? (
              <HeartSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-600 rounded-full transition-colors"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-t-lg flex items-center space-x-2">
                  <PlusIcon className="w-4 h-4" />
                  <span>Add to playlist</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">
                  Go to artist
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">
                  Go to album
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-b-lg">
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;