const {StatusCodes} = require('http-status-codes');

const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const AppError = require('../utils/errors/app-error');

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    async createBooking(data, transaction){
        const response = await Booking.create(data, {transaction});
        return response;
    }
}

module.exports = BookingRepository;