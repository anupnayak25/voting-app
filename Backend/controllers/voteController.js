const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Position = require('../models/Position');

exports.getPositionsAndCandidates = async (req, res) => {
  try {
    const positions = await Position.find({ isActive: true }).sort({ order: 1 });
    const candidates = await Candidate.find({ status: 'approved' });
    
    res.json({ 
      positions: positions.map(p => p.name), 
      candidates: candidates.map(c => ({
        _id: c._id,
        name: c.name,
        position: c.position,
        gender: c.gender,
        photoUrl: c.photoUrl
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions and candidates', error: error.message });
  }
};

exports.submitVote = async (req, res) => {
  const { votes } = req.body; // votes: [{ position, candidateId }]
  const email = req.user?.email; // provided by auth middleware
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  const now = new Date();
  const settings = await Settings.getSettings();
  const start = settings.votingStart;
  const end = settings.votingEnd;
  if (start && now < start) return res.status(403).json({ message: 'Voting has not started yet.' });
  if (end && now > end) return res.status(403).json({ message: 'Voting window has closed.' });
  const user = await User.findOne({ email });
  if (!user || user.hasVoted) {
    return res.status(403).json({ message: 'Already voted or user not found.' });
  }
  // Validate votes
  if (!Array.isArray(votes) || votes.length === 0) {
    return res.status(400).json({ message: 'No votes submitted.' });
  }
  // Save vote
  await Vote.create({
    user: user._id,
    votes: votes.map(v => ({ position: v.position, candidate: v.candidateId }))
  });
  user.hasVoted = true;
  await user.save();
  res.json({ message: 'Vote submitted successfully.' });
};
