// components/pages/RecentlyPlayed.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  PlayIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const RecentlyPlayed = () => {
  const navigate = useNavigate();
  // State for managing liked songs
  const [likedSongs, setLikedSongs] = useState(new Set([1, 3, 7])); // Some songs are pre-liked
  const [activeMenu, setActiveMenu] = useState(null);

  // Mock recently played data
  const recentlyPlayed = [
    { id: 1, title: 'Anti-Hero', artist: 'Taylor Swift', duration: '3:20', album: 'Midnights', playedAt: '2 hours ago' },
    { id: 2, title: 'As It Was', artist: 'Harry Styles', duration: '2:47', album: "Harry's House", playedAt: '5 hours ago' },
    { id: 3, title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', album: 'Dreamland', playedAt: '1 day ago' },
    { id: 4, title: 'Running Up That Hill', artist: 'Kate Bush', duration: '5:03', album: 'Hounds of Love', playedAt: '1 day ago' },
    { id: 5, title: 'Bad Habit', artist: 'Steve Lacy', duration: '3:51', album: 'Gemini Rights', playedAt: '2 days ago' },
    { id: 6, title: 'About Damn Time', artist: 'Lizzo', duration: '3:11', album: 'Special', playedAt: '2 days ago' },
    { id: 7, title: 'We Don\'t Talk About Bruno', artist: 'Encanto Cast', duration: '3:36', album: 'Encanto', playedAt: '3 days ago' },
    { id: 8, title: 'Easy On Me', artist: 'Adele', duration: '3:44', album: '30', playedAt: '3 days ago' },
    { id: 9, title: 'Shivers', artist: 'Ed Sheeran', duration: '3:27', album: '=', playedAt: '4 days ago' },
    { id: 10, title: 'Cold Heart', artist: 'Elton John & Dua Lipa', duration: '3:22', album: 'The Lockdown Sessions', playedAt: '4 days ago' }
  ];

  const handlePlaySong = (songId) => {
    console.log('Playing song:', songId);
    // Here you would typically integrate with your music player
  };

  const handleLike = (e, songId) => {
    e.stopPropagation();
    const newLikedSongs = new Set(likedSongs);
    if (newLikedSongs.has(songId)) {
      newLikedSongs.delete(songId);
      console.log('Unliked song:', songId);
    } else {
      newLikedSongs.add(songId);
      console.log('Liked song:', songId);
    }
    setLikedSongs(newLikedSongs);
  };

  const handleMenuClick = (e, songId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === songId ? null : songId);
  };

  const handleMenuAction = (action, song) => {
    setActiveMenu(null);
    switch (action) {
      case 'addToPlaylist':
        console.log('Add to playlist:', song.title);
        break;
      case 'goToArtist':
        console.log('Go to artist:', song.artist);
        break;
      case 'goToAlbum':
        console.log('Go to album:', song.album);
        break;
      case 'share':
        console.log('Share song:', song.title);
        break;
      default:
        break;
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <ClockIcon className="w-24 h-24 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-medium">Recently Played</p>
          <h1 className="text-4xl font-bold text-white mb-2">Your Listening History</h1>
          <p className="text-gray-400">Songs you've played recently</p>
        </div>
      </div>

      {/* Play All Button */}
      <div className="flex items-center space-x-4">
        <button className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
          <PlayIcon className="w-6 h-6 text-white ml-1" />
        </button>
      </div>

      {/* Songs List */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 text-sm text-gray-400 font-medium">
            <div>#</div>
            <div>Title</div>
            <div>Album</div>
            <div>Played</div>
            <div>Duration</div>
            <div></div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {recentlyPlayed.map((song, index) => (
            <div
              key={song.id}
              className="p-4 hover:bg-gray-700/50 transition-colors group cursor-pointer relative"
            >
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 items-center text-sm">
                <div className="text-gray-400 group-hover:hidden">{index + 1}</div>
                <div className="hidden group-hover:flex items-center">
                  <button
                    onClick={() => handlePlaySong(song.id)}
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <PlayIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div
                  onClick={() => navigate(`/song/${song.id}`)}
                >
                  <p className="text-white font-medium">{song.title}</p>
                  <p className="text-gray-400">{song.artist}</p>
                </div>
                <div className="text-gray-400">{song.album}</div>
                <div className="text-gray-400">{song.playedAt}</div>
                <div className="text-gray-400">{song.duration}</div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleLike(e, song.id)}
                    className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                  >
                    {likedSongs.has(song.id) ? (
                      <HeartSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => handleMenuClick(e, song.id)}
                      className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                    {activeMenu === song.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                        <button
                          onClick={() => handleMenuAction('addToPlaylist', song)}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-t-lg flex items-center space-x-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Add to playlist</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction('goToArtist', song)}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                        >
                          Go to artist
                        </button>
                        <button
                          onClick={() => handleMenuAction('goToAlbum', song)}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                        >
                          Go to album
                        </button>
                        <button
                          onClick={() => handleMenuAction('share', song)}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-b-lg"
                        >
                          Share
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyPlayed;