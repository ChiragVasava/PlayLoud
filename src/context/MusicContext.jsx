// context/MusicContext.jsx (SIMPLE FIX)
import React, { createContext, useState, useEffect } from 'react';
import { musicService } from '../utils/musicService';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  // Basic state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Create persistent audio element
  const [audioElement] = useState(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    return audio; 
  });

  // Simple song database lookup for next/previous
  const [allSongs, setAllSongs] = useState([]);
  
  // Setup audio event listeners
  useEffect(() => {
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    const handleEnded = () => {
      console.log('🎵 Song ended, current song:', currentSong?.title);
      console.log('🎵 All songs available:', allSongs.length);
      setIsPlaying(false);
      // Auto-play next song
      if (allSongs.length > 0) {
        console.log('🎵 Auto-playing next song');
        nextSong();
      }
    };

    // Add event listeners
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    // Set initial volume
    audioElement.volume = volume / 100;

    // Cleanup
    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, volume]);

  // Load all songs when context is first created
  useEffect(() => {
    // This is just for initial setup - could be replaced with API call
    const fetchAllSongs = async () => {
      try {
        console.log('🎵 Fetching all songs...');
        // Use musicService to fetch songs from Appwrite
        const data = await musicService.getAllSongs();
        console.log('🎵 Songs fetched successfully:', data.length, 'songs');
        console.log('🎵 Songs data:', data);
        setAllSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
        // Fallback to empty array
        console.log('🎵 Using fallback empty songs array');
        setAllSongs([]);
      }
    };

    fetchAllSongs();
  }, []);

  // Play a song
  const playSong = (song) => {
    console.log('🎵 Playing song:', song?.title, 'ID:', song?.$id);
    console.log('🎵 Song audio URL:', song?.audioUrl);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Simple next song function - just picks a random song if none available
  const nextSong = () => {
    console.log('🎵 Next song clicked');
    console.log('🎵 Current song:', currentSong?.title, 'ID:', currentSong?.$id);
    console.log('🎵 All songs count:', allSongs.length);
    console.log('🎵 All songs:', allSongs.map(s => ({ title: s.title, id: s.$id })));

    if (!currentSong) return;

    // Find index of current song in all songs
    const currentIndex = allSongs.findIndex(song => song.$id === currentSong.$id);
    console.log('🎵 Current song index:', currentIndex);

    // Get next song or loop back to first
    const nextIndex = currentIndex >= 0 && currentIndex < allSongs.length - 1
      ? currentIndex + 1
      : 0;
    console.log('🎵 Next song index:', nextIndex);

    // Play the next song if available
    if (allSongs.length > 0) {
      console.log('🎵 Playing next song:', allSongs[nextIndex]?.title);
      playSong(allSongs[nextIndex]);
    } else {
      // Just play the current song again if no other songs
      console.log('🎵 No songs available, restarting current song');
      audioElement.currentTime = 0;
      setIsPlaying(true);
    }
  };

  // Simple previous song function
  const previousSong = () => {
    console.log('🎵 Previous song clicked');
    console.log('🎵 Current song:', currentSong?.title, 'ID:', currentSong?.$id);
    console.log('🎵 All songs count:', allSongs.length);
    console.log('🎵 All songs:', allSongs.map(s => ({ title: s.title, id: s.$id })));

    if (!currentSong) return;

    // Find index of current song
    const currentIndex = allSongs.findIndex(song => song.$id === currentSong.$id);
    console.log('🎵 Current song index:', currentIndex);

    // Get previous song or loop to last
    const prevIndex = currentIndex > 0
      ? currentIndex - 1
      : allSongs.length - 1;
    console.log('🎵 Previous song index:', prevIndex);

    // Play the previous song if available
    if (allSongs.length > 0) {
      console.log('🎵 Playing previous song:', allSongs[prevIndex]?.title);
      playSong(allSongs[prevIndex]);
    } else {
      // Just restart the current song
      console.log('🎵 No songs available, restarting current song');
      audioElement.currentTime = 0;
      setIsPlaying(true);
    }
  };

  // Handle play/pause and song changes
  useEffect(() => {
    if (!audioElement || !currentSong) return;
    
    audioElement.src = currentSong.audioUrl;
    
    if (isPlaying) {
      audioElement.play().catch(error => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audioElement.pause();
    }
  }, [currentSong, isPlaying, audioElement]);

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Update progress
  const handleProgressChange = (newProgress) => {
    const newTime = (newProgress / 100) * duration;
    audioElement.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  // Update volume
  const handleVolumeChange = (newVolume) => {
    audioElement.volume = newVolume / 100;
    setVolume(newVolume);
  };
  
  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        progress,
        playSong,
        nextSong,
        previousSong,
        togglePlayPause,
        handleProgressChange,
        handleVolumeChange,
        setAllSongs
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};