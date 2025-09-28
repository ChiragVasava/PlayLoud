// components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  SparklesIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import authService from '../utils/auth';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Listen to auth state changes
    const handleAuthChange = () => {
      setIsLoggedIn(authService.isLoggedIn());
      setCurrentUser(authService.getCurrentUser());
    };

    // Listen to storage changes (for cross-component auth updates)
    const handleStorageChange = (e) => {
      if (e.key === 'playloud_auth' || e.key === 'playloud_user') {
        handleAuthChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      authService.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsProfileOpen(false);
      console.log('User logged out');
    }
  };

  const handleLogin = () => {
    navigate('/login');
    console.log('User Navigates to Login');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
    { id: 'browse', label: 'Browse', icon: MusicalNoteIcon, href: '/browse' },
    { id: 'library', label: 'Library', icon: BookOpenIcon, href: '/library' },
    { id: 'premium', label: 'Premium', icon: SparklesIcon, href: '/premium', isPremium: true }
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">

          {/* Logo - Compact */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                  <MusicalNoteIcon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
                PlayLoud
              </span>
            </a>
          </div>

          {/* Search Bar - Compact */}
          <div className="flex-1 max-w-lg mx-6 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search songs, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-full py-2 pl-8 pr-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Links - Compact */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${location.pathname === item.href
                    ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                    : item.isPremium
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile Menu - Compact */}
          <div className="flex items-center space-x-2">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              {isLoggedIn ? (
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-gray-700/50 transition-all duration-200 group"
                >
                  <img
                    src={currentUser?.avatar || "https://avatars.githubusercontent.com/u/149458923?s=96&v=4"}
                    alt="Profile"
                    className="w-7 h-7 rounded-full border-2 border-green-500 group-hover:border-green-400 transition-colors"
                  />
                  <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                  <span>Log In</span>
                </button>
              )}

              {/* Profile Dropdown Menu - Compact */}
              {isLoggedIn && isProfileOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50 transform transition-all duration-200">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <img
                        src={currentUser?.avatar || "https://avatars.githubusercontent.com/u/149458923?s=96&v=4"}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border-2 border-green-500"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{currentUser?.name || "John Doe"}</p>
                        <p className="text-gray-400 text-xs">{currentUser?.email || "john.doe@email.com"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* <Link to="/profile"> */}
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors w-full text-left text-sm"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    {/* </Link> */}
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors w-full text-left text-sm"
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left text-sm"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-full py-2 pl-8 pr-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-800/95 backdrop-blur-md border-t border-gray-700">
          <div className="px-3 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left ${location.pathname === item.href
                    ? 'bg-green-500/20 text-green-400'
                    : item.isPremium
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;