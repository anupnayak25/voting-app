const Candidate = require('../models/Candidate');
const Settings = require('../models/Settings');

// Set registration due date
toISOString = d => new Date(d).toISOString();
exports.setDueDate = async (req, res) => {
  const { dueDate } = req.body;
  if (!dueDate) return res.status(400).json({ message: 'Due date required' });
  const settings = await Settings.getSettings();
  settings.registrationDueDate = new Date(dueDate);
  await settings.save();
  res.json({ message: 'Due date updated', dueDate: settings.registrationDueDate });
};

exports.getDueDate = async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ dueDate: settings.registrationDueDate });
};

// Voting window management
exports.setVotingWindow = async (req, res) => {
  const { start, end } = req.body;
  if (!start) return res.status(400).json({ message: 'Start date required' });
  const settings = await Settings.getSettings();
  settings.votingStart = new Date(start);
  settings.votingEnd = end ? new Date(end) : undefined;
  await settings.save();
  res.json({ message: 'Voting window updated', start: settings.votingStart, end: settings.votingEnd || null });
};

exports.getVotingWindow = async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ start: settings.votingStart || null, end: settings.votingEnd || null });
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
