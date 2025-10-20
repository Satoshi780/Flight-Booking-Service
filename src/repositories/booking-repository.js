const {StatusCodes} = require('http-status-codes');

const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const AppError = require('../utils/errors/app-error');

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }
}

module.exports = BookingRepository;