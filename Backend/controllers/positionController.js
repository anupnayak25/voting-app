const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// Get all positions
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find({ isActive: true }).sort({ order: 1 });
    res.json({ positions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions', error: error.message });
  }
};

// Add new position (admin only)
exports.addPosition = async (req, res) => {
  try {
    const { name, displayName, order } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and display name are required' });
    }
    
    const position = await Position.create({ name, displayName, order: order || 0 });
    res.json({ message: 'Position added successfully', position });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Position already exists' });
    } else {
      res.status(500).json({ message: 'Error adding position', error: error.message });
    }
  }
};

// Update position (admin only)
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, isActive, order } = req.body;
    
    const position = await Position.findByIdAndUpdate(
      id, 
      { name, displayName, isActive, order }, 
      { new: true, runValidators: true }
    );
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json({ message: 'Position updated successfully', position });
  } catch (error) {
    res.status(500).json({ message: 'Error updating position', error: error.message });
  }
};

// Delete position (admin only)
exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any candidates are using this position
    const candidatesCount = await Candidate.countDocuments({ position: id });
    if (candidatesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete position. ${candidatesCount} candidates are registered for this position.` 
      });
    }
    
    const position = await Position.findByIdAndDelete(id);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting position', error: error.message });
  }
};

// Get voting analytics/histogram data
exports.getVotingAnalytics = async (req, res) => {
  try {
    const positions = await Position.find({ isActive: true }).sort({ order: 1 });
    const analytics = [];

    for (const position of positions) {
      // Get all candidates for this position
      const candidates = await Candidate.find({ 
        position: position.name, 
        status: 'approved' 
      });

      // Get vote counts for each candidate in this position
      const candidateVotes = [];
      
      for (const candidate of candidates) {
        const voteCount = await Vote.countDocuments({
          'votes.candidate': candidate._id
        });
        
        candidateVotes.push({
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateUsn: candidate.usn,
          voteCount
        });
      }

      // Sort candidates by vote count (descending)
      candidateVotes.sort((a, b) => b.voteCount - a.voteCount);

      analytics.push({
        position: position.name,
        positionDisplay: position.displayName,
        totalCandidates: candidates.length,
        totalVotes: candidateVotes.reduce((sum, c) => sum + c.voteCount, 0),
        candidateVotes
      });
    }

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get detailed analytics for a specific position
exports.getPositionAnalytics = async (req, res) => {
  try {
    const { positionName } = req.params;
    
    const position = await Position.findOne({ name: positionName, isActive: true });
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    // Get all candidates for this position
    const candidates = await Candidate.find({ 
      position: positionName, 
      status: 'approved' 
    });

    // Get detailed vote information
    const candidateAnalytics = [];
    
    for (const candidate of candidates) {
      const votes = await Vote.find({
        'votes.candidate': candidate._id
      }).populate('user', 'email');

      candidateAnalytics.push({
        candidate: {
          id: candidate._id,
          name: candidate.name,
          usn: candidate.usn,
          email: candidate.email,
          photoUrl: candidate.photoUrl
        },
        voteCount: votes.length,
        votes: votes.map(vote => ({
          voterId: vote.user._id,
          voterEmail: vote.user.email,
          timestamp: vote.createdAt
        }))
      });
    }

    // Sort by vote count
    candidateAnalytics.sort((a, b) => b.voteCount - a.voteCount);

    res.json({
      position: {
        name: position.name,
        displayName: position.displayName
      },
      totalCandidates: candidates.length,
      totalVotes: candidateAnalytics.reduce((sum, c) => sum + c.voteCount, 0),
      candidateAnalytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching position analytics', error: error.message });
  }
};
