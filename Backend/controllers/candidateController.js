const Candidate = require('../models/Candidate');
const Settings = require('../models/Settings');

exports.registerCandidate = async (req, res) => {
  // Check registration due date
  const settings = await Settings.getSettings();
  if (settings.registrationDueDate && new Date() > settings.registrationDueDate) {
    return res.status(403).json({ message: 'Registration deadline has passed' });
  }

  const { name, usn, email, position, gender } = req.body;
  if (!name || !usn || !email || !position) return res.status(400).json({ message: 'All fields required' });
  
  // Check if candidate already exists with same email or USN
  const existingCandidate = await Candidate.findOne({ $or: [{ email }, { usn }] });
  if (existingCandidate) {
    return res.status(400).json({ message: 'Candidate with this email or USN already exists' });
  }
  
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const candidate = await Candidate.create({ name, usn, email, position, gender, photoUrl });
  res.json({ message: 'Candidate registered and pending approval', candidate });
};

exports.listPending = async (req, res) => {
  const candidates = await Candidate.find({ status: 'pending' });
  res.json({ candidates });
};

// List all candidates (admin view for registration management)
exports.listAll = async (req, res) => {
  const candidates = await Candidate.find();
  res.json({ candidates });
};

exports.approveCandidate = async (req, res) => {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ message: 'Candidate approved', candidate });
};

exports.rejectCandidate = async (req, res) => {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ message: 'Candidate rejected', candidate });
};

exports.deleteCandidate = async (req, res) => {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ message: 'Candidate deleted' });
};
