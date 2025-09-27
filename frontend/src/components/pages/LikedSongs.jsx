// components/pages/LikedSongs.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  HeartIcon,
  PlayIcon,
  PauseIcon,
  EllipsisHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const LikedSongs = () => {

  const navigate = useNavigate();

  // State for managing liked songs (all songs start as liked since this is the liked songs page)
  const [likedSongs, setLikedSongs] = useState(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  const [activeMenu, setActiveMenu] = useState(null);

  // Mock liked songs data
  const likedSongsData = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', album: 'After Hours' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', album: 'Ã· (Divide)' },
    { id: 3, title: 'Dance Monkey', artist: 'Tones and I', duration: '3:29', album: 'The Kids Are Coming' },
    { id: 4, title: 'Watermelon Sugar', artist: 'Harry Styles', duration: '2:54', album: 'Fine Line' },
    { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', album: 'Future Nostalgia' },
    { id: 6, title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', album: 'SOUR' },
    { id: 7, title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', duration: '2:21', album: 'F*CK LOVE 3: OVER YOU' },
    { id: 8, title: 'Peaches', artist: 'Justin Bieber ft. Daniel Caesar', duration: '3:18', album: 'Justice' },
    { id: 9, title: 'Industry Baby', artist: 'Lil Nas X & Jack Harlow', duration: '3:32', album: 'MONTERO' },
    { id: 10, title: 'Montero (Call Me By Your Name)', artist: 'Lil Nas X', duration: '2:17', album: 'MONTERO' }
  ];

  // Filter out unliked songs
  const displayedSongs = likedSongsData.filter(song => likedSongs.has(song.id));

  const handlePlaySong = (songId) => {
    console.log('Playing song:', songId);
    // Here you would typically integrate with your music player
  };

  const handleLike = (e, songId) => {
    e.stopPropagation();
    const newLikedSongs = new Set(likedSongs);
    if (newLikedSongs.has(songId)) {
      newLikedSongs.delete(songId);
      console.log('Removed from liked songs:', songId);
    } else {
      newLikedSongs.add(songId);
      console.log('Added to liked songs:', songId);
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
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <HeartIcon className="w-24 h-24 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-medium">Playlist</p>
          <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
          <p className="text-gray-400">{displayedSongs.length} songs</p>
        </div>
      </div>

      {/* Play Button */}
      <div className="flex items-center space-x-4">
        <button className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
          <PlayIcon className="w-6 h-6 text-white ml-1" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Songs List */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 text-sm text-gray-400 font-medium">
            <div>#</div>
            <div>Title</div>
            <div>Album</div>
            <div>Duration</div>
            <div></div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {displayedSongs.map((song, index) => (
            <div
              key={song.id}
              className="p-4 hover:bg-gray-700/50 transition-colors group cursor-pointer relative"
            >
              <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center text-sm">
                <div className="text-gray-400 group-hover:hidden">{index + 1}</div>
                <div className="hidden group-hover:flex items-center">
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlaySong(song.id)}
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <PlayIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div onClick={() => navigate(`/song/${song.id}`)}>
                  <p className="text-white font-medium">{song.title}</p>
                  <p className="text-gray-400">{song.artist}</p>
                </div>
                <div className="text-gray-400">{song.album}</div>
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

export default LikedSongs;