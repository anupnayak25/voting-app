require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const adminModule = require('./routes/admin');
const adminRoutes = adminModule.router || adminModule;
const { adminAuth } = adminModule;
const candidateRoutes = require('./routes/candidate');

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Missing MONGO_URI environment variable');
  process.exit(1);
}

// Helper to mask credentials when logging
function redactMongoUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, (m, u) => `://${u}:***@`);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected:', redactMongoUri(mongoUri));
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

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
