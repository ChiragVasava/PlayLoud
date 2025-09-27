// components/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  // Move mock data here temporarily
  const featuredPlaylists = [
    { id: 1, title: 'Top Hits 2024', cover: './src/assets/top-hits.jpg', description: 'Your daily dose of hit music' },
    { id: 2, title: 'Fresh Beats', cover: './src/assets/fresh-beats.jpg', description: 'Ready-to-go party tracks' },
    { id: 3, title: 'Classical Favs', cover: './src/assets/classical.jpg', description: 'Timeless instrumentals' }
  ];

  const trendingSongs = [
    { id: 1, title: 'Calm Down', artist: 'Rema', duration: '3:25' },
    { id: 2, title: 'Unstoppable', artist: 'Sia', duration: '3:38' },
    { id: 3, title: 'Flowers', artist: 'Miley Cyrus', duration: '3:12' }
  ];

  return (
    <div>
      {/* Featured Playlists */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-lg hover:bg-gray-600 transition group cursor-pointer"
            >
              <img src={playlist.cover} alt="cover" className="w-full h-40 object-cover rounded-lg mb-3" />
              <h3 className="font-semibold text-lg group-hover:underline">{playlist.title}</h3>
              <p className="text-sm text-gray-400">{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section>
        <h2 className="text-xl font-bold mb-4">Trending Songs</h2>
        <ul className="space-y-2">
          {trendingSongs.map((song, idx) => (
            <li
              key={song.id}
              onClick={() => navigate(`/song/${song.id}`)}
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium">{song.title}</p>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{song.duration}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;