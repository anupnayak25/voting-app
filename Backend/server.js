// File upload middleware
const fileUpload = require('./config/expressFileUpload');
app.use(fileUpload);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS: allow all origins
app.use(cors({
  origin: (origin, cb) => cb(null, true), // reflect any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Removed 'x-admin-pass' since admin header auth is disabled
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
// Express 5 with path-to-regexp v6 can throw on '*' pattern; CORS middleware already handles preflight
// Removed explicit app.options('*', cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;


const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const adminModule = require('./routes/admin');
const adminRoutes = adminModule.router || adminModule;
const { adminAuth } = adminModule;
const candidateRoutes = require('./routes/candidate');
const positionRoutes = require('./routes/position');

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/position', positionRoutes);


const mongoUri = process.env.MONGO_URI;
const mongoPoolSize = process.env.MONGO_POOL_SIZE ? Number(process.env.MONGO_POOL_SIZE) : 10;

if (!mongoUri) {
  console.error('Missing MONGO_URI environment variable');
  process.exit(1);
}

// Helper to mask credentials when logging
function redactMongoUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, (m, u) => `://${u}:***@`);
}

// Use async/await for connection
(async () => {
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: mongoPoolSize,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log(`[mongoose] Connected with pool size: ${mongoPoolSize}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed on app termination');
  process.exit(0);
});
