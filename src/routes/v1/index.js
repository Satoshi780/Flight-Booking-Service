const express=require('express');

const router=express.Router();
const {InfoController,BookingController }=require('../../controllers');

router.get('/info',InfoController.info);
router.post('/bookings',BookingController.createBooking);

module.exports=router;