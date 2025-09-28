// App.jsx (updated with Appwrite integration)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import BrowsePage from './components/pages/BrowsePage';
import SearchPage from './components/pages/SearchPage';
import PlaylistPage from './components/pages/PlaylistPage';
import SongPage from './components/pages/SongPage';
import GenrePage from './components/pages/GenrePage';
import MusicPlayer from './components/MusicPlayer';
import Footer from './components/Footer';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ProfilePage from './components/profile/ProfilePage';
import CreatePlaylist from './components/pages/CreatePlaylist';
import LikedSongs from './components/pages/LikedSongs';
import RecentlyPlayed from './components/pages/RecentlyPlayed';
import Library from './components/pages/Library';
import AllPlaylists from './components/pages/AllPlaylists';
import Premium from './components/pages/Premium';
import Modal from './components/ui/Modal';
import authService from './utils/auth';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize authentication on app startup
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await authService.initializeAuth();
        setIsAuthenticated(authService.isLoggedIn());
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const handleAuthChange = () => {
      setIsAuthenticated(authService.isLoggedIn());
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleNavigation = (destination) => {
      switch (destination) {
        case 'home': navigate('/'); break;
        case 'likedSongs': navigate('/liked-songs'); break;
        case 'recentlyPlayed': navigate('/recently-played'); break;
        case 'library': navigate('/library'); break;
        case 'browse': navigate('/browse'); break;
        case 'profile': navigate('/profile'); break;
        case 'createPlaylist': navigate('/create-playlist'); break;
        case 'allPlaylists': navigate('/all-playlists'); break;
        case 'login': navigate('/login'); break;
        default: navigate('/'); break;
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar onNavigate={handleNavigation} />
        </div>
        <main className="lg:ml-60 ml-12 pt-20 pb-24 px-4 min-h-screen">
          <div className="max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Footer />
          <MusicPlayer />
        </div>
      </div>
    );
  };

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading PlayLoud...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? 
            <LoginForm setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? 
            <SignupForm setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? 
            <ForgotPasswordForm /> : 
            <Navigate to="/" />
          } 
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/liked-songs" element={<LikedSongs />} />
                  <Route path="/recently-played" element={<RecentlyPlayed />} />
                  <Route path="/all-playlists" element={<AllPlaylists />} />
                  <Route path="/playlist/:id" element={<PlaylistPage />} />
                  <Route path="/song/:id" element={<SongPage />} />
                  <Route path="/genre/:genre" element={<GenrePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/create-playlist" element={<CreatePlaylist />} />
                  <Route path="/premium" element={<Premium />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;