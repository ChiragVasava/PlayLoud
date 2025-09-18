// components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
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

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Demo state
  const [activeTab, setActiveTab] = useState('home');
  
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search logic here
    }
  };

  // Handle logout
  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      setIsLoggedIn(false);
      setIsProfileOpen(false);
      console.log('User logged out');
      // Implement logout logic here
    }
  };

  // Handle login
  const handleLogin = () => {
    console.log('Redirecting to login...');
    // Implement login redirect logic here
  };

  // Navigation items with different colors
  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: HomeIcon, 
      href: '/',
      colors: 'text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30'
    },
    { 
      id: 'browse', 
      label: 'Browse', 
      icon: MusicalNoteIcon, 
      href: '/browse',
      colors: 'text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30'
    },
    { 
      id: 'library', 
      label: 'Library', 
      icon: BookOpenIcon, 
      href: '/library',
      colors: 'text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30'
    },
    { 
      id: 'premium', 
      label: 'Premium', 
      icon: SparklesIcon, 
      href: '/premium', 
      isPremium: true,
      colors: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:from-yellow-300 hover:via-orange-400 hover:to-red-400'
    }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 border-b-2 border-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
                  <MusicalNoteIcon className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent hidden sm:block tracking-tight">
                PlayLoud
              </span>
            </a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gradient-to-r from-blue-800/30 to-purple-800/30 backdrop-blur-sm border-2 border-transparent rounded-full py-4 pl-12 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:from-blue-700/40 hover:to-purple-700/40 shadow-lg"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/20"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    activeTab === item.id
                      ? item.isPremium
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-yellow-500/30'
                        : `${item.colors} shadow-xl`
                      : item.isPremium
                      ? 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-2xl'
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 border border-transparent hover:border-blue-400/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Profile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button className="md:hidden p-2 text-blue-300 hover:text-blue-200 transition-colors rounded-lg hover:bg-blue-500/20">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              {isLoggedIn ? (
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-full hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 group border-2 border-transparent hover:border-blue-400/50"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-3 border-gradient-to-r from-red-400 via-yellow-400 to-green-400 group-hover:border-blue-400 transition-all duration-300 shadow-lg"
                  />
                  <ChevronDownIcon className={`w-4 h-4 text-blue-300 transition-all duration-300 ${isProfileOpen ? 'rotate-180 text-yellow-400' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  <span>Log In</span>
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {isLoggedIn && isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-gradient-to-r from-blue-500/50 to-purple-500/50 py-3 z-50 transform transition-all duration-300 animate-in slide-in-from-top-5 backdrop-blur-lg">
                  {/* User Info */}
                  <div className="px-6 py-4 border-b border-gradient-to-r from-blue-500/30 to-purple-500/30">
                    <div className="flex items-center space-x-4">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                        alt="Profile"
                        className="w-14 h-14 rounded-full border-3 border-gradient-to-r from-red-400 via-yellow-400 to-green-400 shadow-lg"
                      />
                      <div>
                        <p className="text-white font-bold text-lg">John Doe</p>
                        <p className="text-blue-300 text-sm font-medium">john.doe@email.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center space-x-3 px-6 py-4 text-blue-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 font-medium"
                    >
                      <UserCircleIcon className="w-6 h-6 text-green-400" />
                      <span>Profile</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center space-x-3 px-6 py-4 text-blue-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 font-medium"
                    >
                      <Cog6ToothIcon className="w-6 h-6 text-yellow-400" />
                      <span>Settings</span>
                    </a>
                    <hr className="my-2 mx-6 border-gradient-to-r from-blue-500/30 to-purple-500/30" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 transition-all duration-200 w-full text-left font-medium"
                    >
                      <ArrowRightOnRectangleIcon className="w-6 h-6" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-blue-300 hover:text-white transition-colors rounded-lg hover:bg-blue-500/20"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-7 h-7" />
              ) : (
                <Bars3Icon className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gradient-to-r from-blue-800/40 to-purple-800/40 border-2 border-blue-500/30 rounded-full py-3 pl-12 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-lg border-t-2 border-gradient-to-r from-blue-500 to-purple-500">
          <div className="px-6 py-6 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    activeTab === item.id
                      ? item.isPremium
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl'
                        : `${item.colors} shadow-xl`
                      : item.isPremium
                      ? 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white hover:from-yellow-400 hover:to-orange-400'
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
