import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// User Services
export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Role Services
export const roleService = {
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  getRole: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  createRole: async (roleData: any) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },
  updateRole: async (id: string, roleData: any) => {
    const response = await api.patch(`/roles/${id}`, roleData);
    return response.data;
  },
  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

// Permission Services
export const permissionService = {
  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },
  createPermission: async (permissionData: any) => {
    const response = await api.post('/permissions', permissionData);
    return response.data;
  },
  updatePermission: async (id: string, permissionData: any) => {
    const response = await api.patch(`/permissions/${id}`, permissionData);
    return response.data;
  },
  deletePermission: async (id: string) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};

export default api; 