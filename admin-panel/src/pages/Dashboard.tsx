import React from 'react';
import { useQuery } from 'react-query';
import { userService, roleService, permissionService } from '../services/api';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, bgColor, to }: { 
  title: string; 
  value: number | string; 
  icon: string; 
  bgColor: string;
  to: string;
}) => {
  return (
    <Link to={to} className="block">
      <div className={`${bgColor} rounded-lg shadow-md p-6 flex items-center justify-between`}>
        <div>
          <p className="text-white text-sm opacity-80">{title}</p>
          <h3 className="text-white text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="text-white text-4xl opacity-80">{icon}</div>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  // Fetch users count
  const { data: userData, isLoading: isLoadingUsers } = useQuery('users', async () => {
    const response = await userService.getUsers();
    return response.data;
  });

  // Fetch roles count
  const { data: roleData, isLoading: isLoadingRoles } = useQuery('roles', async () => {
    const response = await roleService.getRoles();
    return response.data;
  });

  // Fetch permissions count
  const { data: permissionData, isLoading: isLoadingPermissions } = useQuery('permissions', async () => {
    const response = await permissionService.getPermissions();
    return response.data;
  });

  const isLoading = isLoadingUsers || isLoadingRoles || isLoadingPermissions;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Users" 
            value={userData?.length || 0} 
            icon="👤" 
            bgColor="bg-blue-600" 
            to="/users"
          />
          <StatCard 
            title="Total Roles" 
            value={roleData?.length || 0} 
            icon="🔑" 
            bgColor="bg-green-600" 
            to="/roles"
          />
          <StatCard 
            title="Total Permissions" 
            value={permissionData?.length || 0} 
            icon="🛡️" 
            bgColor="bg-purple-600" 
            to="/permissions"
          />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          {isLoadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : userData && userData.length > 0 ? (
            <ul className="divide-y">
              {userData.slice(0, 5).map((user: any) => (
                <li key={user._id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.username}</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users found</p>
          )}
          <div className="mt-4">
            <Link to="/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all users →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Roles</h2>
          {isLoadingRoles ? (
            <p className="text-gray-500">Loading roles...</p>
          ) : roleData && roleData.length > 0 ? (
            <ul className="divide-y">
              {roleData.slice(0, 5).map((role: any) => (
                <li key={role._id} className="py-3">
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-gray-500 truncate">{role.description || 'No description'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No roles found</p>
          )}
          <div className="mt-4">
            <Link to="/roles" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all roles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
