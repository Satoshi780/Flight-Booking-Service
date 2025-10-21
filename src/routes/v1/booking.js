const express = require('express');
const { BookingController } = require('../../controllers');

const router = express.Router();

// POST /api/v1/bookings - Create a booking
router.post('/', BookingController.createBooking);

module.exports = router;