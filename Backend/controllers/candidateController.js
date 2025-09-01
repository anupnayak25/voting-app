const Candidate = require('../models/Candidate');

exports.registerCandidate = async (req, res) => {
  const { name, usn, email, position, gender } = req.body;
  if (!name || !usn || !email || !position) return res.status(400).json({ message: 'All fields required' });
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const candidate = await Candidate.create({ name, usn, email, position, gender, photoUrl });
  res.json({ message: 'Candidate registered and pending approval', candidate });
};

exports.listPending = async (req, res) => {
  const candidates = await Candidate.find({ status: 'pending' });
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
