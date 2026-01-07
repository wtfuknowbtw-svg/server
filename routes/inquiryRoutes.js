const express = require('express');
const router = express.Router();
const { getInquiries, createInquiry } = require('../controllers/inquiryController');

// TODO: Add auth middleware here to protect routes
router.get('/', getInquiries);
router.post('/', createInquiry);

module.exports = router;
