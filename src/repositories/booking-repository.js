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

    async get(data, transaction){
        const response = await this.model.findByPk(data,{transaction});
        if(!response){
            throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction){
        const response = await this.model.update(data,{
            where:{id},
            returning:true,
            transaction
        });
        return response;
    }
}

module.exports = BookingRepository;