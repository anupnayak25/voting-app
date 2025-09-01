const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');

// List of all positions
const POSITIONS = [
  'vice president',
  'joint secretary',
  'assistant technical coordinator',
  'joint treasurer',
  'joint sports secretary',
  'asst. cultural co-ordinator',
  'asst. magazine editor male',
  'asst. magazine editor female',
  'asst. event modulator',
  'asst. social media co-ordinator'
];

exports.getPositionsAndCandidates = async (req, res) => {
  const candidates = await Candidate.find();
  res.json({ positions: POSITIONS, candidates });
};

exports.submitVote = async (req, res) => {
  const { email, votes } = req.body; // votes: [{ position, candidateId }]
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
