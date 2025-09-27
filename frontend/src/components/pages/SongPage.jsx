// components/pages/SongPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const SongPage = () => {
  const { id } = useParams();

  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-4">Song Player</h2>
      <p className="text-gray-400">Now playing song ID: {id}</p>
      <div className="mt-8 bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
        <img
          src="/src/assets/album.jpg"
          alt="song cover"
          className="w-full h-full object-cover rounded mb-4"
        />
        <h3 className="text-xl font-bold">Song Title {id}</h3>
        <p className="text-gray-400">Artist Name</p>
      </div>
    </div>
  );
};

export default SongPage;

