import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../config.env') });

// Import models
import Permission from '../models/permission.model';
import Role from '../models/role.model';
import User from '../models/user.model';

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL as string);
    console.log('📊 DB Connected Successfully!');
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
    process.exit(1);
  }
};

// Define initial permissions
const initialPermissions = [
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

  // Add more domain-specific permissions as needed
];

// Define initial roles
const initialRoles = [
  {
    name: 'superAdmin',
    description: 'Super administrator with all permissions',
    permissions: [] // Will be populated with all permission IDs
  },
  {
    name: 'admin',
    description: 'Administrator with limited permissions',
    permissions: [] // Will be populated with selected permission IDs
  },
  {
    name: 'user',
    description: 'Regular user with minimal permissions',
    permissions: [] // Will have only read-only permissions
  }
];

// Import seed data
const importData = async () => {
  try {
    // Clear existing data
    await Permission.deleteMany({});
    await Role.deleteMany({});

    // Create permissions
    const createdPermissions = await Permission.create(initialPermissions);
    console.log('Permissions created successfully');

    // Map permission names to their IDs
    const permissionMap = createdPermissions.reduce((map, permission) => {
      map[permission.name] = permission._id;
      return map;
    }, {} as { [key: string]: mongoose.Types.ObjectId });

    // Prepare roles with permissions
    const rolesToCreate = initialRoles.map(role => {
      if (role.name === 'superAdmin') {
        // Super admin gets all permissions
        return {
          ...role,
          permissions: createdPermissions.map(p => p._id)
        };
      } else if (role.name === 'admin') {
        // Admin gets many but not all permissions
        return {
          ...role,
          permissions: [
            permissionMap['user:read'],
            permissionMap['user:create'],
            permissionMap['user:update'],
            permissionMap['role:read'],
            permissionMap['permission:read'],
            // Adding new project and link permissions for admin
            permissionMap['project:read'],
            permissionMap['project:create'],
            permissionMap['project:update'],
            permissionMap['link:read'],
            permissionMap['link:create'],
            permissionMap['link:update']
          ]
        };
      } else if (role.name === 'user') {
        // Regular user gets minimal permissions
        return {
          ...role,
          permissions: [
            permissionMap['user:read'],
            // Adding read-only access to projects for regular users
            permissionMap['project:read'],
            permissionMap['link:read']
          ]
        };
      }
      return role;
    });

    // Create roles
    const createdRoles = await Role.create(rolesToCreate);
    console.log('Roles created successfully');

    // Check if any users exist already
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Find the superAdmin role
      const superAdminRole = createdRoles.find(role => role.name === 'superAdmin');
      
      if (superAdminRole) {
        // Create initial superAdmin user
        await User.create({
          name: 'Super Admin',
          username: 'superadmin',
          role: superAdminRole._id,
          password: 'password123', // Change this in production!
          passwordConfirm: 'password123',
        });
        console.log('Initial super admin user created');
      }
    }

    console.log('✅ Data import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  importData();
});