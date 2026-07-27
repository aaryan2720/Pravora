const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, tenantGuard } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public: Diner can submit a ticket
router.post('/', asyncHandler(createComplaint));

// Staff only: manage complaints
router.use(protect, tenantGuard);
router.get('/', asyncHandler(getComplaints));
router.patch('/:id', asyncHandler(updateComplaintStatus));
router.delete('/:id', asyncHandler(deleteComplaint));

module.exports = router;
