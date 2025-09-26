import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm text-center py-4 border-t border-gray-800 mt-20">
      <div className="max-w-screen-xl mx-auto px-4">
        
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2">
          <a href="#" className="hover:text-white transition">About</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        {/* Branding */}
        <p className="text-xs text-gray-500 tracking-tight">
          © {new Date().getFullYear()} PlayLoud, All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;