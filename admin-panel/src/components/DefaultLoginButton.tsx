// src/components/DefaultLoginButton.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

interface DefaultLoginButtonProps {
  className?: string;
}

const DefaultLoginButton: React.FC<DefaultLoginButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDefaultLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login('admin', 'admin123');
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      setError('Failed to login with default credentials');
      console.error('Default login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDefaultLogin}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${className}`}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login as Admin'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Username: admin, Password: admin123
      </p>
    </div>
  );
};

export default DefaultLoginButton;