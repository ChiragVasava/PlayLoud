// components/pages/GenrePage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const GenrePage = () => {
  const { genre } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{genre} Music</h2>
      <p className="text-gray-400 mb-8">Explore the best {genre} tracks</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition">
            <img 
              src="/assets/fallback.jpg" 
              alt="cover" 
              className="w-full h-36 object-cover rounded mb-2"
            />
            <h4 className="text-sm font-semibold">{genre} Song {i + 1}</h4>
            <p className="text-xs text-gray-400">Artist {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenrePage;