const { StatusCodes } = require('http-status-codes');
const {BookingService}=require('../services');
const {SuccessResponse,ErrorResponse}=require('../utils/common');


async function createBooking(req,res){
    try{
        const response=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noOfSeats:req.body.noOfSeats
        });
        SuccessResponse.data=response;
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    }catch(error){
        ErrorResponse.error=error;
        return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }

}

async function makePayment(req,res){
    try{
        // Coerce incoming values to numbers and validate
        const bookingId = Number(req.body.bookingId);
        const userId = Number(req.body.userId);
        const totalCost = Number(req.body.totalCost);

        if(Number.isNaN(bookingId) || Number.isNaN(userId) || Number.isNaN(totalCost)){
            ErrorResponse.error = {
                statusCode: StatusCodes.BAD_REQUEST,
                explanation: 'bookingId, userId and totalCost must be valid numbers'
            };
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        const response=await BookingService.makePayment({  
            bookingId,
            userId,
            totalCost
        });
        SuccessResponse.data=response;
        return res
        .status(StatusCodes.OK)
        .json(SuccessResponse);
    }catch(error){
        ErrorResponse.error=error;
        return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
}

module.exports={
    createBooking,
    makePayment
}