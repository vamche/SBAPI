import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Pilot Schema
 */
const PilotSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  teams: {
    type: [String], // [mongoose.Schema.ObjectId],
    required: false
  },
  license: {
    type: String,
    required: false
  },
  transportType: {
    type: String, // mongoose.Schema.ObjectId,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false,
    default: false
  },
  isAvailable: {
    type: Boolean,
    required: false
  },
  // TO DO : IDK!
  status: {
    type: String,
    required: false
  },
  battery: {
    type: Number,
    required: false
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  // TO DO : IDK!
  last_updated_location_time: {
    type: Date,
    required: false
  },
  last_updated_date_time: {
    type: Date,
    required: false
  },
  registration_status: {
    type: Boolean,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PilotSchema.index({ location: '2dsphere' });


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
PilotSchema.method({
});

/**
 * Statics
 */
PilotSchema.statics = {
  /**
   * Get pilot
   * @param {ObjectId} id - The objectId of pilot.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('userId')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByUserId(userId) {
    return this.findOne()
        .where('userId', userId)
        .populate('userId')
        .exec()
        .then((order) => {
                if (order) {
                    return order;
                }
                const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
        });
  },

  /**
   * List pilots in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of pilots to be skipped.
   * @param {number} limit - Limit number of pilots to be returned.
   * @returns {Promise<Pilot[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate('userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

};

/**
 * @typedef Pilot
 */
export default mongoose.model('Pilot', PilotSchema);
