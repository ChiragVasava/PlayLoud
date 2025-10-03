// components/MusicPlayer.jsx (SIMPLE FIX)
import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';
import { useMusic } from '../context/useMusic';

const MusicPlayer = () => {
  const { 
    currentSong, 
    isPlaying,
    togglePlayPause,
    nextSong,
    previousSong,
    volume,
    currentTime,
    duration,
    progress,
    handleProgressChange,
    handleVolumeChange
  } = useMusic();

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't render if no current song
  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full z-40 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-6">
        {/* 🎵 Left: Now Playing Info */}
        <div className="flex items-center space-x-4 w-1/3">
          <img
            src={currentSong.coverImage}
            alt="album cover"
            className="w-12 h-12 rounded shadow-lg object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/48/4a5568/ffffff?text=♪';
            }}
          />
          <div className="hidden sm:block">
            <p className="font-semibold text-sm truncate">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* ▶️ Center: Controls */}
        <div className="flex-1 flex flex-col items-center w-full max-w-lg">
          {/* Control Buttons */}
          <div className="flex items-center space-x-6 mb-2">
            {/* Previous Button - ALWAYS ENABLED */}
            <button 
              onClick={previousSong}
              className="text-gray-300 hover:text-white transition-colors"
              title="Previous"
            >
              <BackwardIcon className="w-5 h-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 transition-transform flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Next Button - ALWAYS ENABLED */}
            <button 
              onClick={nextSong}
              className="text-gray-300 hover:text-white transition-colors"
              title="Next"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 🎚️ Right: Volume */}
        <div className="flex items-center justify-end space-x-4 w-1/3">
          <div className="hidden sm:flex items-center space-x-2 w-28">
            <button 
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 80)} 
              className="text-gray-400 hover:text-white"
            >
              {volume > 0 ? (
                <SpeakerWaveIcon className="w-5 h-5" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 accent-green-500 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;