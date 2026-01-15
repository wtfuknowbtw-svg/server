const express = require('express');
const router = express.Router();
const { getInquiries, createInquiry, deleteInquiry } = require('../controllers/inquiryController');

// TODO: Add auth middleware here to protect routes
router.get('/', getInquiries);
router.post('/', createInquiry);
router.delete('/:id', deleteInquiry);

module.exports = router;
