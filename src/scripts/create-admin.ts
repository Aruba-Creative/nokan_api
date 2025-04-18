/**
 * Script to create or reset the admin user
 * Run with: npx ts-node src/scripts/create-admin.ts
 */

import '../paths';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Role from '../models/role.model';
import Permission from '../models/permission.model';
import config from '../config';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../config.env') });

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.databaseUri as string);
    console.log('📊 Connected to database');

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
          { name: 'user:create', description: 'Create users' },
          { name: 'user:read', description: 'Read user information' },
          { name: 'user:update', description: 'Update user details' },
          { name: 'user:delete', description: 'Delete users' },
          
          { name: 'role:create', description: 'Create roles' },
          { name: 'role:read', description: 'Read role information' },
          { name: 'role:update', description: 'Update role details' },
          { name: 'role:delete', description: 'Delete roles' },
          
          { name: 'permission:create', description: 'Create permissions' },
          { name: 'permission:read', description: 'Read permission information' },
          { name: 'permission:update', description: 'Update permission details' },
          { name: 'permission:delete', description: 'Delete permissions' },
        ];
        
        const createdPermissions = await Permission.insertMany(defaultPermissions);
        console.log(`Created ${createdPermissions.length} default permissions.`);
        
        superAdminRole = await Role.create({
          name: 'superAdmin',
          description: 'Super administrator with all permissions',
          permissions: createdPermissions.map(p => p._id)
        });
      } else {
        superAdminRole = await Role.create({
          name: 'superAdmin',
          description: 'Super administrator with all permissions',
          permissions: permissions.map(p => p._id)
        });
      }
      
      console.log('Created superAdmin role successfully.');
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Update admin user
      existingAdmin.password = 'admin123';
      existingAdmin.passwordConfirm = 'admin123';
      existingAdmin.role = superAdminRole._id;
      existingAdmin.blocked = false;
      
      await existingAdmin.save();
      
      console.log('Admin user updated successfully:');
      console.log(`- Username: ${existingAdmin.username}`);
      console.log(`- Password: admin123`);
    } else {
      // Create new admin user
      const newAdmin = await User.create({
        name: 'Super Admin',
        username: 'admin',
        password: 'admin123',
        passwordConfirm: 'admin123',
        role: superAdminRole._id
      });
      
      console.log('Admin user created successfully:');
      console.log(`- Username: ${newAdmin.username}`);
      console.log(`- Password: admin123`);
    }
    
    console.log('IMPORTANT: Change this password in production!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from database');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the script
createAdmin()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });