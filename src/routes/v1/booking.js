
const express = require('express');
const { BookingController } = require('../../controllers');
const { validateCreateBooking, validateMakePayment } = require('../../middlewares/booking-middleware');

const router = express.Router();

// POST /api/v1/bookings - Create a booking
router.post('/', validateCreateBooking, BookingController.createBooking);

// Support both singular and plural endpoint names for payments
router.post('/payment', validateMakePayment, BookingController.makePayment);
router.post('/payments', validateMakePayment, BookingController.makePayment);
module.exports = router;