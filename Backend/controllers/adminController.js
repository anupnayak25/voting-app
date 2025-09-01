const Candidate = require('../models/Candidate');

// Set registration due date
toISOString = d => new Date(d).toISOString();
exports.setDueDate = (req, res) => {
  const { dueDate } = req.body;
  if (!dueDate) return res.status(400).json({ message: 'Due date required' });
  process.env.REGISTRATION_DUE_DATE = toISOString(dueDate);
  res.json({ message: 'Due date updated', dueDate: process.env.REGISTRATION_DUE_DATE });
};

exports.getDueDate = (req, res) => {
  res.json({ dueDate: process.env.REGISTRATION_DUE_DATE });
};

// Candidate management
exports.addCandidate = async (req, res) => {
  const { name, position, gender } = req.body;
  if (!name || !position) return res.status(400).json({ message: 'Name and position required' });
  const candidate = await Candidate.create({ name, position, gender });
  res.json({ message: 'Candidate added', candidate });
};

exports.editCandidate = async (req, res) => {
  const { id } = req.params;
  const { name, position, gender } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(id, { name, position, gender }, { new: true });
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ message: 'Candidate updated', candidate });
};

exports.deleteCandidate = async (req, res) => {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ message: 'Candidate deleted' });
};
