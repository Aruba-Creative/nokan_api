import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
                }
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/roles" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
                }
              >
                Roles
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/permissions" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
                }
              >
                Permissions
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-4">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
