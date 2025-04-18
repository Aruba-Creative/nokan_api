import mongoose from 'mongoose';
import User from '../models/user.model';
import Role from '../models/role.model';
import Permission from '../models/permission.model';
import config from '../config';

/**
 * Utility function to create a default super admin user if none exists
 * This should be called once during application startup
 */
export const createDefaultAdmin = async (): Promise<void> => {
  try {
    console.log('Checking for default admin user...');
    
    // Check if any users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Users already exist, skipping default admin creation.');
      return;
    }

    console.log('No users found. Creating default super admin...');

    // Check if superAdmin role exists
    let superAdminRole = await Role.findOne({ name: 'superAdmin' });
    
    if (!superAdminRole) {
      console.log('Creating superAdmin role...');
      
      // Get all permissions
      const permissions = await Permission.find();
      
      if (permissions.length === 0) {
        console.log('No permissions found. Creating default permissions...');
        
        // Create default permissions
        const defaultPermissions = [
          // User permissions
          { name: 'user:create', description: 'Create users' },
          { name: 'user:read', description: 'Read user information' },
          { name: 'user:update', description: 'Update user details' },
          { name: 'user:delete', description: 'Delete users' },
          
          // Role permissions
          { name: 'role:create', description: 'Create roles' },
          { name: 'role:read', description: 'Read role information' },
          { name: 'role:update', description: 'Update role details' },
          { name: 'role:delete', description: 'Delete roles' },
          
          // Permission permissions
          { name: 'permission:create', description: 'Create permissions' },
          { name: 'permission:read', description: 'Read permission information' },
          { name: 'permission:update', description: 'Update permission details' },
          { name: 'permission:delete', description: 'Delete permissions' },
          
          // Project permissions (new)
          { name: 'project:create', description: 'Create projects' },
          { name: 'project:read', description: 'Read project information' },
          { name: 'project:update', description: 'Update project details' },
          { name: 'project:delete', description: 'Delete projects' },

          // Link permissions (new)
          { name: 'link:create', description: 'Create links' },
          { name: 'link:read', description: 'Read link information' },
          { name: 'link:update', description: 'Update link details' },
          { name: 'link:delete', description: 'Delete links' },
        ];
        
        const createdPermissions = await Permission.insertMany(defaultPermissions);
        console.log(`Created ${createdPermissions.length} default permissions.`);
        
        // Use created permissions
        superAdminRole = await Role.create({
          name: 'superAdmin',
          description: 'Super administrator with all permissions',
          permissions: createdPermissions.map(p => p._id)
        });
      } else {
        // Use existing permissions
        superAdminRole = await Role.create({
          name: 'superAdmin',
          description: 'Super administrator with all permissions',
          permissions: permissions.map(p => p._id)
        });
      }
      
      console.log('Created superAdmin role successfully.');
    }

    // Create default super admin user
    const defaultAdmin = await User.create({
      name: 'Super Admin',
      username: 'admin',
      password: 'admin123',
      passwordConfirm: 'admin123',
      role: superAdminRole._id
    });

    console.log('Default super admin created successfully:');
    console.log(`- Username: ${defaultAdmin.username}`);
    console.log(`- Password: admin123`);
    console.log('IMPORTANT: Change this password in production!');
    
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

export default createDefaultAdmin;