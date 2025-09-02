const User = require('../models/User');
const transporter = require('./mailer');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  // Voting window enforcement (optional end)
  const now = new Date();
  const settings = await Settings.getSettings();
  const start = settings.votingStart;
  const end = settings.votingEnd;
  if (start && now < start) return res.status(403).json({ message: 'Voting has not started yet.' });
  if (end && now > end) return res.status(403).json({ message: 'Voting window has closed.' });

  let user = await User.findOne({ email });
  if (user && user.hasVoted) {
    return res.status(403).json({ message: 'You have already voted. OTP not sent.' });
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  if (!user) user = new User({ email });
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Voting OTP',
      text: `Your OTP for voting is: ${otp}`
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('[mailer] sendMail error:', err);
    res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const now = new Date();
  const settings = await Settings.getSettings();
  const start = settings.votingStart;
  const end = settings.votingEnd;
  if (start && now < start) return res.status(403).json({ message: 'Voting has not started yet.' });
  if (end && now > end) return res.status(403).json({ message: 'Voting window has closed.' });
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }
  user.otp = null;
  user.otpExpires = null;
  await user.save();
  const token = jwt.sign({ email: user.email, uid: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '2h' });
  res.json({ message: 'OTP verified.', token });
};
