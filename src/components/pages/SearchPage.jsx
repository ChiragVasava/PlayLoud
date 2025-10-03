// components/pages/SearchPage.jsx (ENHANCED)
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { databases, APPWRITE_CONFIG } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useMusic } from '../../context/useMusic';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playSong } = useMusic();
  const query = searchParams.get('q') || '';
  
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all songs, artists, and genres
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        
        // Fetch all songs from database
        const songsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          'songs',
          []
        );

        // Process songs
        const allSongs = songsResponse.documents.map(song => ({
          $id: song.$id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          genre: song.genre,
          duration: song.duration,
          coverImage: song.coverImage,
          fileId: song.fileId,
          audioUrl: `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${song.fileId}/view?project=${APPWRITE_CONFIG.projectId}`
        }));
        
        // Extract unique artists and genres
        const uniqueArtists = [...new Set(allSongs.map(song => song.artist))];
        const uniqueGenres = [...new Set(allSongs.filter(song => song.genre).map(song => song.genre))];
        
        // If query is empty, just show all songs
        if (!query) {
          setSongs(allSongs);
          setArtists(uniqueArtists.map(name => ({ 
            name, 
            image: `/artists/${name.replace(/\s+/g, '_').replace(/[&,]/g, '').toLowerCase()}.jpg`, 
            songs: allSongs.filter(song => song.artist === name)
          })));
          setGenres(uniqueGenres.map(name => ({
            name,
            songs: allSongs.filter(song => song.genre === name)
          })));
        } else {
          // Filter songs, artists, and genres based on query
          const filteredSongs = allSongs.filter(song => 
            song.title?.toLowerCase().includes(query.toLowerCase()) ||
            song.artist?.toLowerCase().includes(query.toLowerCase()) ||
            song.album?.toLowerCase().includes(query.toLowerCase()) ||
            song.genre?.toLowerCase().includes(query.toLowerCase())
          );
          
          const matchingArtists = uniqueArtists.filter(artist => 
            artist.toLowerCase().includes(query.toLowerCase())
          );
          
          const matchingGenres = uniqueGenres.filter(genre => 
            genre && genre.toLowerCase().includes(query.toLowerCase())
          );
          
          setSongs(filteredSongs);
          setArtists(matchingArtists.map(name => ({ 
            name, 
            image: `/artists/${name.replace(/\s+/g, '_').replace(/[&,]/g, '').toLowerCase()}.jpg`, 
            songs: allSongs.filter(song => song.artist === name)
          })));
          setGenres(matchingGenres.map(name => ({
            name,
            songs: allSongs.filter(song => song.genre === name)
          })));
        }
      } catch (error) {
        console.error('Error loading songs:', error);
        setError('Failed to load songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, [query]);

  const handlePlaySong = (song) => {
    playSong(song);
  };

  const handleGenreClick = (genre) => {
    // Search with genre as query
    navigate(`/search?q=${encodeURIComponent(genre)}`);
  };

  const handleArtistClick = (artist) => {
    // Search with artist name as query
    navigate(`/search?q=${encodeURIComponent(artist)}`);
  };

  // Format song duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Searching for music...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        {query ? (
          <h2 className="text-2xl font-bold mb-4">
            Results for: <span className="text-green-400">"{query}"</span>
          </h2>
        ) : (
          <h2 className="text-2xl font-bold mb-4">Browse Music</h2>
        )}
        
        {songs.length === 0 && artists.length === 0 && genres.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 mb-4">No results found for "{query}"</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Browse All Music
            </button>
          </div>
        )}
      </div>

      {/* Genres Section */}
      {genres.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Genres</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <button
                key={genre.name}
                onClick={() => handleGenreClick(genre.name)}
                className="bg-gradient-to-br from-gray-800 to-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                {genre.name} <span className="text-gray-400">({genre.songs.length})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.map((artist) => (
              <div 
                key={artist.name} 
                className="text-center cursor-pointer group"
                onClick={() => handleArtistClick(artist.name)}
              >
                <div className="relative rounded-full overflow-hidden aspect-square mb-3 mx-auto">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=random&size=200`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h4 className="font-semibold text-sm group-hover:text-green-400 transition-colors">{artist.name}</h4>
                <p className="text-xs text-gray-400">{artist.songs.length} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Songs Section */}
      {songs.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4">Songs</h3>
          <div className="bg-gray-800/20 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-700 text-sm text-gray-400 font-medium">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Artist</div>
              <div>Album</div>
              <div>Duration</div>
            </div>

            {/* Songs List */}
            <div className="divide-y divide-gray-700/50">
              {songs.map((song, index) => (
                <div
                  key={song.$id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-gray-700/30 transition-colors group cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="w-8 flex items-center">
                    <span className="text-gray-400 text-sm group-hover:hidden">
                      {index + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                      className="hidden group-hover:flex w-8 h-8 bg-green-500 rounded-full items-center justify-center hover:scale-110 transition-transform"
                    >
                      <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Title & Cover */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40/4a5568/ffffff?text=♪';
                      }}
                    />
                    <div>
                      <p className="text-white font-medium text-sm hover:underline cursor-pointer">
                        {song.title}
                      </p>
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="flex items-center">
                    <p 
                      className="text-gray-400 text-sm hover:text-white hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtistClick(song.artist);
                      }}
                    >
                      {song.artist}
                    </p>
                  </div>

                  {/* Album */}
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm hover:text-white hover:underline cursor-pointer truncate">
                      {song.album}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;