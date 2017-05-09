import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Manager Schema
 */
const ManagerSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: false
  },
  teams: {
    type: [String], // [mongoose.Schema.ObjectId],
    required: false
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  isFranchiseAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  franchise: {
    type: String,
    ref: 'Franchise',
    default: null,
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

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ManagerSchema.method({
});

/**
 * Statics
 */
ManagerSchema.statics = {
  /**
   * Get Manager
   * @param {ObjectId} id - The objectId of Manager.
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
        const err = new APIError('No such manager exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByUserId(userId) {
    return this.findOne()
      .where('user', userId)
      .populate('user')
      .populate('franchise')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such manager exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List Managers in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Managers to be skipped.
   * @param {number} limit - Limit number of Managers to be returned.
   * @returns {Promise<Manager[]>}
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
 * @typedef Manager
 */
export default mongoose.model('Manager', ManagerSchema);
