import dotenv from 'dotenv';
import path from 'path';
import { Secret } from 'jsonwebtoken';

// Load environment variables from config.env file
dotenv.config({ path: path.join(__dirname, '../../config.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUri: process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/nokan-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-jwt-key-should-be-long-and-secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '90d',
  jwtCookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '90', 10),
  clientUrls: {
    development: ['http://localhost:3000'],
    production: ['https://yourproduction.com']
  }
};