import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './Auth/routes/auth.route.js';
import vaultRoutes from './Vault/routes/vault.route.js';

const app = express();
const PORT = process.env.PORT || 3000;
const PRIMARY_MONGO_URI = process.env.MONGO_URI;
const FALLBACK_MONGO_URI = 'mongodb://127.0.0.1:27017/securevault';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    service: 'SecureVault Backend API',
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 SecureVault backend server running on http://localhost:${PORT}`);
});

// MongoDB Connection Handler with automatic local fallback
const connectDatabase = async () => {
  if (PRIMARY_MONGO_URI) {
    try {
      await mongoose.connect(PRIMARY_MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Atlas database successfully!');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to MongoDB Atlas (IP restriction or network timeout). Switching to local MongoDB...');
    }
  }

  try {
    await mongoose.connect(FALLBACK_MONGO_URI);
    console.log('✅ Connected to Local MongoDB database (mongodb://127.0.0.1:27017/securevault) successfully!');
  } catch (err) {
    console.error('❌ Failed to connect to local MongoDB:', err.message);
  }
};

connectDatabase();
