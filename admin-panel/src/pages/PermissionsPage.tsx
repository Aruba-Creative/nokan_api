import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permissionService } from '../services/api';

interface Permission {
  _id: string;
  name: string;
  description: string;
}

const PermissionsPage = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [permissionForm, setPermissionForm] = useState({ name: '', description: '' });

  // Fetch permissions
  const { data, isLoading, error } = useQuery('permissions', async () => {
    const response = await permissionService.getPermissions();
    return response.data;
  });

  // Create permission mutation
  const createPermissionMutation = useMutation(
    (permissionData: any) => permissionService.createPermission(permissionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('permissions');
        setShowCreateModal(false);
        setPermissionForm({ name: '', description: '' });
      },
    }
  );

  // Update permission mutation
  const updatePermissionMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => permissionService.updatePermission(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('permissions');
        setShowEditModal(false);
        setSelectedPermission(null);
      },
    }
  );

  // Delete permission mutation
  const deletePermissionMutation = useMutation(
    (permissionId: string) => permissionService.deletePermission(permissionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('permissions');
      },
    }
  );

  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    createPermissionMutation.mutate(permissionForm);
  };

  const handleUpdatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermission) {
      updatePermissionMutation.mutate({
        id: selectedPermission._id,
        data: permissionForm,
      });
    }
  };

  const handleDeletePermission = (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      deletePermissionMutation.mutate(permissionId);
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionForm({
      name: permission.name,
      description: permission.description || '',
    });
    setShowEditModal(true);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <button 
          onClick={() => {
            setPermissionForm({ name: '', description: '' });
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Create Permission
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2">Loading permissions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded text-red-700">
          Failed to load permissions. Please try again.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.map((permission: Permission) => (
                <tr key={permission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{permission.name}</td>
                  <td className="px-6 py-4">{permission.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(permission)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePermission(permission._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {data && data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No permissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Permission</h2>
            <form onSubmit={handleCreatePermission}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  disabled={createPermissionMutation.isLoading}
                >
                  {createPermissionMutation.isLoading ? 'Creating...' : 'Create Permission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Permission</h2>
            <form onSubmit={handleUpdatePermission}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPermission(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  disabled={updatePermissionMutation.isLoading}
                >
                  {updatePermissionMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage; 