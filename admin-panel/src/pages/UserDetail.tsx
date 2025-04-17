import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService, roleService } from '../services/api';

interface User {
  _id: string;
  name: string;
  username: string;
  role: {
    _id: string;
    name: string;
  } | string;
  blocked: boolean;
}

interface Role {
  _id: string;
  name: string;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [userForm, setUserForm] = useState<{
    name: string;
    username: string;
    password: string;
    role: string;
    blocked: boolean;
  }>({
    name: '',
    username: '',
    password: '',
    role: '',
    blocked: false
  });

  // Fetch user data
  const { isLoading, error } = useQuery(['user', id], async () => {
    if (!id) return null;
    const response = await userService.getUser(id);
    const userData = response.data;
    
    // Update form state with user data
    setUserForm({
      name: userData.name,
      username: userData.username,
      password: '',
      role: typeof userData.role === 'object' ? userData.role._id : userData.role || '',
      blocked: userData.blocked
    });
    
    return userData;
  });

  // Fetch roles for dropdown
  const { data: roles } = useQuery('roles', async () => {
    const response = await roleService.getRoles();
    return response.data;
  });

  // Update user mutation
  const updateUserMutation = useMutation(
    (userData: any) => {
      if (!id) throw new Error('User ID is required');
      return userService.updateUser(id, userData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', id]);
        queryClient.invalidateQueries('users');
        navigate('/users');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create update object, omitting password if empty
    const updateData = {
      name: userForm.name,
      username: userForm.username,
      role: userForm.role,
      blocked: userForm.blocked,
      ...(userForm.password ? { password: userForm.password } : {})
    };
    
    updateUserMutation.mutate(updateData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setUserForm({ ...userForm, [name]: checked });
    } else {
      setUserForm({ ...userForm, [name]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
        Failed to load user information. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <button
          onClick={() => navigate('/users')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Back to Users
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={userForm.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={userForm.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (leave empty to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={userForm.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={userForm.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a role</option>
              {roles?.map((role: Role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="blocked"
              id="blocked"
              checked={userForm.blocked}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="blocked" className="ml-2 block text-sm text-gray-900">
              Blocked
            </label>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              disabled={updateUserMutation.isLoading}
            >
              {updateUserMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail; 