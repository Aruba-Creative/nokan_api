import React, { useState, useEffect } from 'react';

const Header = () => {
  const [username, setUsername] = useState<string>('Admin');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div>
        <h2 className="text-gray-600">{currentTime}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Welcome, {username}</span>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm">{username.charAt(0)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
