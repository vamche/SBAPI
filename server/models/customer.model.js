import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Customer Schema
 */
const CustomerSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  teams: {
    type: [String], // [mongoose.Schema.ObjectId],
    required: false
  },
  isMerchant: {
    type: Boolean,
    required: false,
    default: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
        type: [Number],
        default: [78.4867, 17.3850]
    }
  },
  address: {
    type: String,
    required: false,
  },
  franchise: {
    type: String, // mongoose.Schema.ObjectId,
    ref: 'Franchise',
    default: null
  },
  registration_status: {
    type: String,
    required: false,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CustomerSchema.index({ location: '2dsphere' });


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
CustomerSchema.method({
});

/**
 * Statics
 */
CustomerSchema.statics = {
  /**
   * Get Customer
   * @param {ObjectId} id - The objectId of Customer.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('user')
      .populate('franchise')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such customer exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByUserId(userId) {
    return this.findOne()
      .where('user', userId)
      .populate('user')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such customer exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List Customers in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Customers to be skipped.
   * @param {number} limit - Limit number of Customers to be returned.
   * @returns {Promise<Customer[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByTeam({ team, skip = 0, limit = 50 } = {}) {
    return this.find()
      .where('teams').in([team])
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

};

/**
 * @typedef Customer
 */
export default mongoose.model('Customer', CustomerSchema);
