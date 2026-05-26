import mongoose from 'mongoose';
import { environment } from './environment';

/**
 * Connects to MongoDB Atlas or local MongoDB instance.
 * Falls back gracefully if connection fails (demo mode uses in-memory data).
 */
export const connectDatabase = async (): Promise<boolean> => {
  try {
    await mongoose.connect(environment.mongoUri);
    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('⚠ MongoDB connection failed — running in demo mode with mock data');
    return false;
  }
};
