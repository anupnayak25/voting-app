const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  gender: { type: String }, // For magazine editor male/female
  photoUrl: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Common query patterns: by position & status & gender filtering
candidateSchema.index({ position: 1, status: 1 });
candidateSchema.index({ usn: 1 }, { unique: true });
candidateSchema.index({ email: 1 });
candidateSchema.index({ gender: 1, position: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
