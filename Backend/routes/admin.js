const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin authentication disabled; middleware retained as a no-op for future reinstatement.
function adminAuth(_req, _res, next) { next(); }

router.post('/set-due-date', adminAuth, adminController.setDueDate);
router.get('/get-due-date', adminAuth, adminController.getDueDate);
router.post('/set-voting-window', adminAuth, adminController.setVotingWindow);
router.get('/get-voting-window', adminAuth, adminController.getVotingWindow);
router.post('/candidate', adminAuth, adminController.addCandidate);
router.put('/candidate/:id', adminAuth, adminController.editCandidate);
router.delete('/candidate/:id', adminAuth, adminController.deleteCandidate);

module.exports = { router, adminAuth };
