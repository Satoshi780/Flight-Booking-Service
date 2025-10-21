const axios=require('axios');
const {StatusCodes}=require('http-status-codes');
const {BookingRepository}=require('../repositories');
const db=require('../models');
const AppError = require('../utils/errors/app-error');
const {ServerConfig}=require('../config');
const {Enums}=require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const bookingRepository=new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount= data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount };
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);
       
        const response=await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,{
            seats: data.noOfSeats
        });
        await transaction.commit();
        return booking;
    } catch(error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data){
    // 1) Load booking without a transaction
    const bookingDetails = await bookingRepository.get(data.bookingId);

    // 2) Quick guards that don't need a transaction
    if (bookingDetails.status === CANCELLED) {
        throw new AppError('Cannot make payment for a cancelled booking', StatusCodes.BAD_REQUEST);
    }

    const expectedAmount = Number(bookingDetails.totalCost);
    const paidAmount = Number(data.totalCost);
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    // Expiry check: if expired, persist cancellation WITHOUT a transaction, then error out
    if ((currentTime - bookingTime) > 300000) { // 5 minutes in ms
        // Persist cancellation immediately so it isn't rolled back by any external call failures
        await bookingRepository.update(data.bookingId, { status: CANCELLED });
        // Best-effort: try to return seats to flight service (don't block cancellation on this)
        try {
            await cancelBooking(data.bookingId);
        } catch (e) {
            // swallow to ensure we still report expiry; consider logging in a real app
        }
        throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
    }

    if (Number.isNaN(paidAmount) || paidAmount !== expectedAmount) {
        throw new AppError('Amount of payment doesnt match', StatusCodes.BAD_REQUEST);
    }

    // Ensure the user making the payment owns the booking
    if (Number(bookingDetails.userId) !== Number(data.userId)) {
        throw new AppError('User corresponding to this booking does not match', StatusCodes.UNAUTHORIZED);
    }

    // 3) Proceed to mark as BOOKED inside a transaction
    const transaction = await db.sequelize.transaction();
    try {
        const response = await bookingRepository.update(
            data.bookingId,
            { status: BOOKED },
            transaction
        );
        await transaction.commit();
        return response;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction);

        // Return seats back to flight inventory; use the correct seats count from booking
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
            seats: Number(bookingDetails.noOfSeats),
            dec: 0 // dec=0 -> increase seats back
        });

        // Update booking status to CANCELLED if not already
        if (bookingDetails.status !== CANCELLED) {
            await bookingRepository.update(bookingId, { status: CANCELLED }, transaction);
        }

        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}



module.exports = {
    createBooking,
    makePayment,
    cancelBooking
}