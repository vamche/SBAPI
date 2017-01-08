import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Pilot Schema
 */
const PilotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: false
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
    required: false
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
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  // TO DO : IDK!
  last_updated_location_time: {
    type: String,
    required: false
  },
  last_updated_date_time: {
    type: String,
    required: false
  },
  registration_status: {
    type: String,
    required: false
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
