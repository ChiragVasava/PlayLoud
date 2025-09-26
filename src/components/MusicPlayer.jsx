import React, { useState } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  QueueListIcon
} from '@heroicons/react/24/solid';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(35); // out of 100 for demo
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // Example dummy song
  const currentSong = {
    title: 'Levitating',
    artist: 'Dua Lipa ft. DaBaby',
    cover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIACQAJAMBIgACEQEDEQH/xAAaAAACAwEBAAAAAAAAAAAAAAAABgMEBQEH/8QAMRAAAgEDAgIHBgcAAAAAAAAAAQIDAAQRBRIGUSEiMUFhgdETFDKxwfAVFiNCcZKT/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAEDAgT/xAAdEQADAAICAwAAAAAAAAAAAAAAAQIREgMhMVFx/9oADAMBAAIRAxEAPwCOXhvRVTP4Xaf5Cl/UtG0xN2yxgXltjFNs84K4FZUsPvEm1R20T15IVl+BNGkW8syxpbR5JwOqBXV0vTUl2TeyXpwSse/H34Zp+/Kly1jLKE2hlChsd5Ppmle/0z3ad4pM7o229mM+NGybwa1pLJSXh+GRQ0NrDIh/cu0g+n8GiraWrbeyuUdiNVtRjYDL4Jpg0HEgQIVO45630rC4P4osNO02W3vdPjuWZy8chRSy5XB+Ic1Q+RqBdRnJaVHWGR2eQCLqgZbPVHcOVW5+KZhNPsnwW3Tyj1+51W3hsBbbRuXHTyNIHFSQM6zsmGGcnPxHuHzPlVLSteuZIbw3E6lwY1jaUgAEk8/P7FYt9qNxf3B9tKGRCduOyuFTW3w7nUKCxAuU76Kns13QgjPbRW2ySk8ui1e5iA2bOjwqwOIr4AYEWR37Tn51yirZbDVFhOLdRS1NsEtvZsct+mctyyc91QDiO9HYkH9T60UUhmhBx1qsEYjSGzwOcZP1ooorOq9Dyz//2Q==',
  };

  return (
    <div className="fixed bottom-0 w-full z-40 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-6">
        
        {/* 🎵 Left: Now Playing Info */}
        <div className="flex items-center space-x-4 w-1/3">
          <img
            src={currentSong.cover}
            alt="album cover"
            className="w-12 h-12 rounded shadow-lg object-cover"
          />
          <div className="hidden sm:block">
            <p className="font-semibold text-sm truncate">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* ▶️ Center: Controls */}
        <div className="flex-1 flex flex-col items-center w-full max-w-lg">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`${shuffle ? 'text-green-400' : 'text-gray-400'} hover:text-white transition`}
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            <button className="text-gray-300 hover:text-white transition">
              <BackwardIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 transition-transform flex items-center justify-center"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>

            <button className="text-gray-300 hover:text-white transition">
              <ForwardIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setRepeat(!repeat)}
              className={`${repeat ? 'text-green-400' : 'text-gray-400'} hover:text-white transition`}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full mt-2">
            <span className="text-xs text-gray-400 w-8 text-right">1:12</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-xs text-gray-400 w-8">3:45</span>
          </div>
        </div>

        {/* 🎚️ Right: Volume & Queue */}
        <div className="flex items-center justify-end space-x-4 w-1/3">
          {/* Queue Button */}
          <button className="text-gray-400 hover:text-white">
            <QueueListIcon className="w-5 h-5" />
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center space-x-2 w-28">
            <button onClick={() => setVolume(0)} className="text-gray-400 hover:text-white">
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
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1.5 accent-green-500 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;