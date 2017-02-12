import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Target Schema
 */
const TargetSchema = new mongoose.Schema({
    date: {
      type: String, // YYYYMMDD
      required: true,
      unique: true
    },
    createdBy: {
      type: String,
      required: false
    },
    target: {
      type: Number,
      required: true,
      default: 500
    },
    description: {
      type: String,
      required: false
    },
    actual: {
      type: Number,
      required: false,
      default: 0,
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
TargetSchema.method({
});

/**
 * Statics
 */
TargetSchema.statics = {
    /**
     * Get target
     * @param {ObjectId} id - The objectId of target.
     * @returns {Promise<Target, APIError>}
     */
    get(id) {
        return this.findById(id)
            .exec()
            .then((target) => {
                if (target) {
                    return target;
                }
                const err = new APIError('No such target exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },

    getByTargetname(targetname) {
        return this.findOne()
            .where('targetname', targetname)
            .exec()
            .then((target) => {
                if (target) {
                    return target;
                }
                const err = new APIError('No such target exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });

    },

    /**
     * List targets in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of targets to be skipped.
     * @param {number} limit - Limit number of targets to be returned.
     * @returns {Promise<Target[]>}
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
 * @typedef Target
 */
export default mongoose.model('Target', TargetSchema);
