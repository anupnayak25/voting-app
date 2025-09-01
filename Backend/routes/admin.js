const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Simple admin auth middleware (password in .env)
function adminAuth(req, res, next) {
  const adminPass = process.env.ADMIN_PASS;
  const pass = req.headers['x-admin-pass'];
  if (!adminPass || pass !== adminPass) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

router.post('/set-due-date', adminAuth, adminController.setDueDate);
router.get('/get-due-date', adminAuth, adminController.getDueDate);
router.post('/candidate', adminAuth, adminController.addCandidate);
router.put('/candidate/:id', adminAuth, adminController.editCandidate);
router.delete('/candidate/:id', adminAuth, adminController.deleteCandidate);

module.exports = { router, adminAuth };
