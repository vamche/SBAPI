import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Timesheet Schema
 */
const TimesheetSchema = new mongoose.Schema({
    isAvailable: {
      type: Boolean,
      required: true
    },
    pilot: {
      type: String,
      required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TimesheetSchema.method({
});

/**
 * Statics
 */
TimesheetSchema.statics = {
    /**
     * Get timesheet
     * @param {ObjectId} id - The objectId of timesheet.
     * @returns {Promise<Timesheet, APIError>}
     */
    get(id) {
        return this.findById(id)
            .exec()
            .then((timesheet) => {
                if (timesheet) {
                    return timesheet;
                }
                const err = new APIError('No such timesheet exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },

   /**
     * List timesheets in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of timesheets to be skipped.
     * @param {number} limit - Limit number of timesheets to be returned.
     * @returns {Promise<Timesheet[]>}
     */
    list({ skip = 0, limit = 50 } = {}) {
        return this.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
};

/**
 * @typedef Timesheet
 */
export default mongoose.model('Timesheet', TimesheetSchema);
