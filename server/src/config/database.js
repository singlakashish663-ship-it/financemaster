const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/financequest';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
    });
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    throw err;
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected gracefully');
}

module.exports = { connectDB, disconnectDB };
