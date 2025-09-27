// components/pages/PlaylistPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const PlaylistPage = () => {
  const { id } = useParams();

  // Mock data for now
  const playlistData = {
    name: `Playlist ${id}`,
    cover: '/src/assets/fallback.jpg',
    description: 'By PlayLoud • 42 songs, 2 hr 13 min'
  };

  return (
    <div>
      <section className="mb-6">
        <div className="flex items-center gap-4">
          <img
            src={playlistData.cover}
            alt="playlist"
            className="w-28 h-28 object-cover rounded-lg"
          />
          <div>
            <p className="uppercase text-xs text-gray-400 font-semibold">Playlist</p>
            <h1 className="text-2xl font-bold">{playlistData.name}</h1>
            <p className="text-sm text-gray-400">{playlistData.description}</p>
          </div>
        </div>
      </section>

      <section>
        <ul className="divide-y divide-gray-700">
          {Array.from({ length: 10 }, (_, i) => (
            <li
              key={i}
              className="flex items-center justify-between py-3 px-2 hover:bg-gray-800 rounded transition group"
            >
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">Track Title {i + 1}</p>
                  <p className="text-xs text-gray-400">Artist Name</p>
                </div>
              </div>
              <button className="text-green-400 hover:text-green-300 text-sm font-medium">▶ Play</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PlaylistPage;