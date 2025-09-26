// components/pages/SearchPage.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');

  const results = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Song/Album ${i + 1}`,
    artist: `Artist ${i + 1}`,
    cover: '/assets/fallback.jpg'
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Search Results for: <span className="text-green-400">"{query}"</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/song/${item.id}`)}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition cursor-pointer"
          >
            <img src={item.cover} alt="cover" className="w-full h-36 object-cover rounded mb-2" />
            <h4 className="text-sm font-semibold truncate">{item.name}</h4>
            <p className="text-xs text-gray-400 truncate">{item.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;