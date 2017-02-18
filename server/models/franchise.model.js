import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Franchise Schema
 */
const FranchiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: false,
  },
  teams: {
    type: [String], // [mongoose.Schema.ObjectId],
    required: false
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
  geo_fence: {
    type: {
      type: String,
      default: 'Polygon'
    },
    coordinates: [[Number]],
    required: false
  },
  registration_status: {
    type: Boolean,
    required: false,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FranchiseSchema.index({ location: '2dsphere' });


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
FranchiseSchema.method({
});

/**
 * Statics
 */
FranchiseSchema.statics = {
  /**
   * Get Franchise
   * @param {ObjectId} id - The objectId of Franchise.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('user')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such franchise exists!', httpStatus.NOT_FOUND);
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
        const err = new APIError('No such franchise exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List Franchises in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Franchises to be skipped.
   * @param {number} limit - Limit number of Franchises to be returned.
   * @returns {Promise<Franchise[]>}
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
 * @typedef Franchise
 */
export default mongoose.model('Franchise', FranchiseSchema);
