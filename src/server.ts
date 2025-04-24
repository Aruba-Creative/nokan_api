import './paths';
import 'reflect-metadata';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import createDefaultAdmin from './utils/create-default-admin';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUri as string, {
      // No need to specify options in Mongoose 7+, they're set by default
    });
    console.log('📊 DB Connected Successfully!');
    
    // Create default admin after successful database connection
    await createDefaultAdmin();
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Start server
const port = config.port;
const server = app.listen(port, () => {
  console.log(`🚀 App is listening at http://127.0.0.1:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});