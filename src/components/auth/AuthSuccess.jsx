// components/auth/AuthSuccess.jsx (NEW FILE)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appwriteAuth from '../../utils/appwriteAuth';

const AuthSuccess = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const result = await appwriteAuth.handleOAuth2Success();
        if (result.success) {
          setIsAuthenticated(true);
          navigate('/');
        } else {
          console.error('OAuth2 success handling failed:', result.error);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in OAuth2 success callback:', error);
        navigate('/login');
      }
    };

    handleSuccess();
  }, [navigate, setIsAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white">Completing login...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;