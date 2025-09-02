const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const adminController = require('../controllers/adminController');
const adminModule = require('./admin');
const adminAuth = adminModule.adminAuth;
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });
router.post('/register', upload.single('photo'), candidateController.registerCandidate);
router.get('/pending', adminAuth, candidateController.listPending);
router.get('/all', adminAuth, candidateController.listAll);
router.post('/:id/approve', adminAuth, candidateController.approveCandidate);
router.post('/:id/reject', adminAuth, candidateController.rejectCandidate);
router.delete('/:id', adminAuth, candidateController.deleteCandidate);

module.exports = router;
