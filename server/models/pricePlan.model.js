import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * PricePlan Schema
 */
const PricePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  baseFare: {
    type: Number,
    required: true
  },
  baseDistanceInKms: {
    type: Number,
    required: true
  },
  farePerExtraKm: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  applicableFor: {
    type: String,
    required: false,
    default: 'B2C'
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
PricePlanSchema.method({
});

/**
 * Statics
 */
PricePlanSchema.statics = {
  /**
   * Get pricePlan
   * @param {ObjectId} id - The objectId of pricePlan.
   * @returns {Promise<PricePlan, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('image')
      .exec()
      .then((pricePlan) => {
        if (pricePlan) {
          return pricePlan;
        }
        const err = new APIError('No such pricePlan exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByName(pricePlanname) {
    return this.findOne()
      .where('pricePlanname', pricePlanname)
      .populate('image')
      .exec()
      .then((pricePlan) => {
        if (pricePlan) {
          return pricePlan;
        }
        const err = new APIError('No such pricePlan exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });

  },

  /**
   * List pricePlans in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of pricePlans to be skipped.
   * @param {number} limit - Limit number of pricePlans to be returned.
   * @returns {Promise<PricePlan[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate('image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef PricePlan
 */
export default mongoose.model('PricePlan', PricePlanSchema);
