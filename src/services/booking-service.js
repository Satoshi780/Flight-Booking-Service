const axios=require('axios');
const {StatusCodes}=require('http-status-codes');
const {BookingRepository}=require('../repositories');
const db=require('../models');
const AppError = require('../utils/errors/app-error');
const {ServerConfig}=require('../config');

const bookingRepository=new BookingRepository();

async function createBooking(data){
    try{
        const result = await db.sequelize.transaction(async function bookingImpl(t){
            const flight=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData=flight.data.data;
            if(flightData.totalSeats < data.noOfSeats){
                throw new AppError('Seats not available',StatusCodes.BAD_REQUEST);
            }
        });
        return result;
    }catch(error){
        throw error;
    }
}


module.exports={
    createBooking
}