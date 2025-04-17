// src/utils/setupDefaultUser.ts

import api, { authService, userService, roleService, permissionService } from '../services/api';

interface DefaultPermissions {
  name: string;
  description: string;
}

interface DefaultRole {
  name: string;
  description: string;
  permissions: string[];
}

interface DefaultUser {
  name: string;
  username: string;
  password: string;
  role: string;
}

/**
 * Sets up default permissions if they don't exist
 * @returns Array of permission IDs
 */
const setupDefaultPermissions = async (): Promise<string[]> => {
  const defaultPermissions: DefaultPermissions[] = [
    { name: 'user:create', description: 'Create users' },
    { name: 'user:read', description: 'View users' },
    { name: 'user:update', description: 'Update users' },
    { name: 'user:delete', description: 'Delete users' },
    { name: 'role:create', description: 'Create roles' },
    { name: 'role:read', description: 'View roles' },
    { name: 'role:update', description: 'Update roles' },
    { name: 'role:delete', description: 'Delete roles' },
    { name: 'permission:create', description: 'Create permissions' },
    { name: 'permission:read', description: 'View permissions' },
    { name: 'permission:update', description: 'Update permissions' },
    { name: 'permission:delete', description: 'Delete permissions' },
  ];

  // Check existing permissions
  const existingPermissions = await permissionService.getPermissions();
  const existingPermissionNames = existingPermissions.data.map((p: any) => p.name);
  
  const permissionIds: string[] = [];

  // Create any missing permissions
  for (const permission of defaultPermissions) {
    if (!existingPermissionNames.includes(permission.name)) {
      try {
        const response = await permissionService.createPermission(permission);
        permissionIds.push(response.data._id);
      } catch (error) {
        console.error(`Failed to create permission ${permission.name}:`, error);
      }
    } else {
      // Find and add the ID of the existing permission
      const existingPermission = existingPermissions.data.find((p: any) => p.name === permission.name);
      if (existingPermission) {
        permissionIds.push(existingPermission._id);
      }
    }
  }

  return permissionIds;
};

/**
 * Sets up a default admin role if it doesn't exist
 * @param permissionIds Array of permission IDs
 * @returns Role ID
 */
const setupDefaultRole = async (permissionIds: string[]): Promise<string | null> => {
  const defaultRole: DefaultRole = {
    name: 'Admin',
    description: 'Administrator with all permissions',
    permissions: permissionIds,
  };

  try {
    // Check if the role already exists
    const existingRoles = await roleService.getRoles();
    const adminRole = existingRoles.data.find((role: any) => role.name === defaultRole.name);
    
    if (adminRole) {
      // Update the role with the latest permissions
      await roleService.updateRole(adminRole._id, {
        ...defaultRole,
      });
      return adminRole._id;
    } else {
      // Create new role
      const response = await roleService.createRole(defaultRole);
      return response.data._id;
    }
  } catch (error) {
    console.error('Failed to set up default role:', error);
    return null;
  }
};

/**
 * Sets up a default admin user if one doesn't exist
 * @param roleId Role ID to assign
 */
const setupDefaultUser = async (roleId: string | null): Promise<void> => {
  if (!roleId) return;
  
  const defaultUser: DefaultUser = {
    name: 'Admin User',
    username: 'admin',
    password: 'admin123',
    role: roleId,
  };

  try {
    // Check if user already exists
    const users = await userService.getUsers();
    const adminUser = users.data.find((user: any) => user.username === defaultUser.username);
    
    if (!adminUser) {
      // Create the default user
      await userService.createUser({
        ...defaultUser,
        passwordConfirm: defaultUser.password,
      });
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
  } catch (error) {
    console.error('Failed to set up default user:', error);
  }
};

/**
 * Setup the default admin user, role, and permissions
 */
export const initializeDefaultUser = async (): Promise<void> => {
  try {
    console.log('Setting up default user, role, and permissions...');
    
    // Set up the permissions first
    const permissionIds = await setupDefaultPermissions();
    
    // Set up the role with the permissions
    const roleId = await setupDefaultRole(permissionIds);
    
    // Set up the user with the role
    await setupDefaultUser(roleId);
    
    console.log('Default setup completed');
  } catch (error) {
    console.error('Error setting up default user:', error);
  }
};

export default initializeDefaultUser;