const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const adminController = require('../controllers/adminController');
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
router.get('/pending', adminController.adminAuth ? candidateController.listPending : candidateController.listPending);
router.post('/:id/approve', adminController.adminAuth ? adminController.approveCandidate : candidateController.approveCandidate);
router.post('/:id/reject', adminController.adminAuth ? adminController.rejectCandidate : candidateController.rejectCandidate);
router.delete('/:id', adminController.adminAuth ? adminController.deleteCandidate : candidateController.deleteCandidate);

module.exports = router;
