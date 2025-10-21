const express = require('express');
const { BookingController } = require('../../controllers');

const router = express.Router();

// POST /api/v1/bookings - Create a booking
router.post('/', BookingController.createBooking);

// Support both singular and plural endpoint names for payments
router.post('/payment', BookingController.makePayment);
router.post('/payments', BookingController.makePayment);
module.exports = router;