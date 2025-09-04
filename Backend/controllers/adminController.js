const Candidate = require("../models/Candidate");
const Settings = require("../models/Settings");
const User = require("../models/User");

// Set registration due date
exports.setDueDate = async (req, res) => {
  try {
    const { dueDate } = req.body;
    if (!dueDate) return res.status(400).json({ message: "Due date required" });
    const parsed = new Date(dueDate);
    if (isNaN(parsed.getTime())) return res.status(400).json({ message: "Invalid date format" });
    const settings = await Settings.getSettings();
    settings.registrationDueDate = parsed;
    await settings.save();
    console.log("[settings] registrationDueDate updated ->", settings.registrationDueDate.toISOString());
    res.json({ message: "Due date updated", dueDate: settings.registrationDueDate });
  } catch (err) {
    console.error("Error saving due date:", err.message);
    res.status(500).json({ message: "Server error saving due date" });
  }
};

exports.getDueDate = async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ dueDate: settings.registrationDueDate });
};

// Voting window management
exports.setVotingWindow = async (req, res) => {
  try {
    const { start, end, timezone } = req.body;
    if (!start) return res.status(400).json({ message: "Start date required" });

    // Handle datetime-local input which comes without timezone info
    // Assume local time if no timezone is provided
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) return res.status(400).json({ message: "Invalid start date" });

    let endDate;
    if (end) {
      endDate = new Date(end);
      if (isNaN(endDate.getTime())) return res.status(400).json({ message: "Invalid end date" });
      if (endDate <= startDate) return res.status(400).json({ message: "End must be after start" });
    }

    const settings = await Settings.getSettings();
    settings.votingStart = startDate;
    settings.votingEnd = endDate;
    await settings.save();

    console.log("[settings] votingWindow updated ->", {
      start: settings.votingStart.toISOString(),
      end: settings.votingEnd ? settings.votingEnd.toISOString() : null,
      startLocal: start,
      endLocal: end,
    });

    res.json({ message: "Voting window updated", start: settings.votingStart, end: settings.votingEnd || null });
  } catch (err) {
    console.error("Error saving voting window:", err.message);
    res.status(500).json({ message: "Server error saving voting window" });
  }
};

exports.getVotingWindow = async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ start: settings.votingStart || null, end: settings.votingEnd || null });
};

// Candidate management
exports.addCandidate = async (req, res) => {
  const { name, position, gender } = req.body;
  if (!name || !position) return res.status(400).json({ message: "Name and position required" });
  const candidate = await Candidate.create({ name, position, gender });
  res.json({ message: "Candidate added", candidate });
};

exports.editCandidate = async (req, res) => {
  const { id } = req.params;
  const { name, position, gender } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(id, { name, position, gender }, { new: true });
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });
  res.json({ message: "Candidate updated", candidate });
};

exports.deleteCandidate = async (req, res) => {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });
  res.json({ message: "Candidate deleted" });
};

// List voted users with optional email search & pagination
exports.getVotedUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 25, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const filter = { hasVoted: true };
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }
    const cursor = User.find(filter)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .select("email createdAt");
    const [users, total] = await Promise.all([cursor.exec(), User.countDocuments(filter)]);
    res.json({
      users,
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit) || 1,
    });
  } catch (err) {
    console.error("[admin][getVotedUsers] error", err);
    res.status(500).json({ message: "Server error fetching voted users" });
  }
};
