const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  gender: { type: String }, // For magazine editor male/female
  photoUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
