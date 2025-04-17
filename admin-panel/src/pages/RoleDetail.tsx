import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { roleService, permissionService } from '../services/api';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[] | { _id: string; name: string }[];
}

interface Permission {
  _id: string;
  name: string;
  description: string;
}

const RoleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [roleForm, setRoleForm] = useState<{
    name: string;
    description: string;
    permissions: string[];
  }>({
    name: '',
    description: '',
    permissions: []
  });

  // Fetch role data
  const { isLoading: isLoadingRole, error: roleError } = useQuery(['role', id], async () => {
    if (!id) return null;
    const response = await roleService.getRole(id);
    const roleData = response.data;
    
    // Update form state with role data
    setRoleForm({
      name: roleData.name,
      description: roleData.description || '',
      permissions: Array.isArray(roleData.permissions) 
        ? roleData.permissions.map((p: any) => typeof p === 'object' ? p._id : p)
        : []
    });
    
    return roleData;
  });

  // Fetch all permissions for the checkboxes
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery('permissions', async () => {
    const response = await permissionService.getPermissions();
    return response.data;
  });

  // Update role mutation
  const updateRoleMutation = useMutation(
    (roleData: any) => {
      if (!id) throw new Error('Role ID is required');
      return roleService.updateRole(id, roleData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['role', id]);
        queryClient.invalidateQueries('roles');
        navigate('/roles');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate(roleForm);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm(prev => {
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(permissionId);
      
      if (index > -1) {
        permissions.splice(index, 1); // Remove permission
      } else {
        permissions.push(permissionId); // Add permission
      }
      
      return { ...prev, permissions };
    });
  };

  const isLoading = isLoadingRole || isLoadingPermissions;
  const error = roleError;

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-2">Loading role data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
        Failed to load role information. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Role</h1>
        <button
          onClick={() => navigate('/roles')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Back to Roles
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={roleForm.name}
              onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={roleForm.description}
              onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          
          <div className="mt-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Permissions</h3>
            <div className="bg-gray-50 p-4 rounded border">
              {permissions && permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission: Permission) => (
                    <div key={permission._id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`permission-${permission._id}`}
                        checked={roleForm.permissions.includes(permission._id)}
                        onChange={() => handlePermissionToggle(permission._id)}
                        className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`permission-${permission._id}`} className="ml-2 block">
                        <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                        {permission.description && (
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No permissions available.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              disabled={updateRoleMutation.isLoading}
            >
              {updateRoleMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleDetail; 