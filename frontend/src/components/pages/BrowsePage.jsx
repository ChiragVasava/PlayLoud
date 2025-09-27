// components/pages/BrowsePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BrowsePage = () => {
  const navigate = useNavigate();

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Electronic', 'Indie', 'Chill', 'Workout'];
  const topCharts = [
    { id: 1, title: 'Anti-Hero', artist: 'Taylor Swift', cover: 'src/assets/taylor.jpg' },
    { id: 2, title: 'As It Was', artist: 'Harry Styles', cover: 'src/assets/harry.jpg' },
    { id: 3, title: 'The Real Slim Shady', artist: 'Eminem', cover: 'src/assets/Eminem.jpg' },
  ];

  return (
    <div>
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">Browse Genres</h2>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre, i) => (
            <button
              key={i}
              onClick={() => navigate(`/genre/${genre}`)}
              className="bg-gradient-to-br from-gray-800 to-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-full transition"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Top Charts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topCharts.map((track) => (
            <div
              key={track.id}
              onClick={() => navigate(`/song/${track.id}`)}
              className="group cursor-pointer rounded-lg overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                {/* Background Image */}
                <img
                  src={track.cover}
                  alt={`${track.title} cover`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300" />

                {/* Text Overlay - Center (appears on hover) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-sm font-semibold text-center line-clamp-2 leading-tight mb-2 drop-shadow-lg">
                    {track.title}
                  </h3>
                  <p className="text-xs text-gray-200 text-center line-clamp-1 drop-shadow-lg mb-4">
                    {track.artist}
                  </p>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track.id);
                    }}
                    className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transform scale-90 hover:scale-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
                    aria-label={`Play ${track.title}`}
                  >
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Always Visible Text Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 drop-shadow-lg">
                    {track.title}
                  </h3>
                  <p className="text-xs text-gray-200 line-clamp-1 drop-shadow-lg">
                    {track.artist}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default BrowsePage;