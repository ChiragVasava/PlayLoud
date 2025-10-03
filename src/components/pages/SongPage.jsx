// components/pages/SongPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG } from '../../lib/appwrite';
import { useMusic } from '../../context/useMusic';

const SongPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useMusic();
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSongData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch song details
        const songResponse = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          'songs',
          id
        );

        setSong(songResponse);

        // Auto-play the song when loaded
        if (songResponse.audioUrl) {
          playSong(songResponse);
        }

      } catch (error) {
        console.error('Error loading song:', error);
        if (error?.code === 404) {
          setError('Song not found');
        } else if (error?.code === 403) {
          setError('Access denied to this song');
        } else {
          setError('Failed to load song');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadSongData();
    }
  }, [id, playSong]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading song...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-400">Song not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-4"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-10">
        <div className="mb-8">
          <img
            src={song.coverImage || '/src/assets/album.jpg'}
            alt={song.title}
            className="w-80 h-80 object-cover rounded-lg shadow-2xl mx-auto mb-6"
            onError={(e) => {
              e.target.src = '/src/assets/album.jpg';
            }}
          />
          <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
          <p className="text-xl text-gray-400 mb-4">{song.artist}</p>
          <p className="text-gray-500">{song.album} • {song.year}</p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          <button
            onClick={() => playSong(song)}
            className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {currentSong?.$id === song.$id && isPlaying ? (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19V6l12 7z"/>
            </svg>
          </button>
        </div>

        {song.genre && (
          <div className="mt-8">
            <span className="inline-block bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
              {song.genre}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongPage;

