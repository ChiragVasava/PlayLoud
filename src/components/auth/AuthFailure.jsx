// components/auth/AuthFailure.jsx (NEW FILE)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timeout = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Login Failed</h2>
          <p className="text-gray-400 mb-4">Something went wrong with Google login.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthFailure;