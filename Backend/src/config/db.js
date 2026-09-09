import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded if not already populated
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config();
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisansetu';
    const conn = await mongoose.connect(mongoURI);
    console.log(`[KisanSetu Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[KisanSetu Database] Connection error: ${error.message}`);
    // Do not crash the entire process if DB is temporarily unavailable
    return null;
  }
};

export default connectDB;
