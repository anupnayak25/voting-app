const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);
