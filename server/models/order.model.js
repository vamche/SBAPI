import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Job Schema
 */
const OrderSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  team: {
    type: String,
    required: false
  },
  pilot: {
    type: String, // mongoose.Schema.ObjectId,
    required: false
  },
  from_name: {
    type: String,
    required: true
  },
  from_phone: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  from_email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  from_address: {
    type: String,
    required: false
  },
  from_location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  from_date_time: {
    type: Date,
    required: false
  },
  to_name: {
    type: String,
    required: true
  },
  to_phone: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  to_email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  to_address: {
    type: String,
    required: false
  },
  to_location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  timeZone: {
    type: Number,
    default: 530
  },
  images: {
    type: [String],
    required: false
  },
  rating: {
    type: Number,
    required: false
  },
  status: {
    type: String, // mongoose.Schema.ObjectId,
    required: true
  },
  timeline: {
    type: [Object], // [{ status: String, timestamp: Date, pilot: String }],
    required: false
  },
  acknowledged_notes: {
    type: String,
    required: false
  },
  acknowledged_signature: {
    type: String,
    required: false
  },
  acknowledged_image: {
    type: String,
    required: false
  },
  acknowledged_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_movement: {
    type: {
      type: String,
      default: 'LineString'
    },
    coordinates: [[Number]]
  },
  pilot_from_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_to_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_completed_date_time: {
    type: Date,
    default: Date.now
  },
  distance_in_meters: {
    type: Number,
    default: 0
  },
  time_in_seconds: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    required: false
  },
  paymentType: {
    type: String, // mongoose.Schema.ObjectId,
    required: false
  },
  createdBy: {
    type: String, // User ID
    required: false
  },
  final_cost: {
    type: Number, // INR
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.index({ from_location: '2dsphere' });
OrderSchema.index({ to_location: '2dsphere' });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
OrderSchema.method({
});

/**
 * Statics
 */
OrderSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
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
   * List orders in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of orders to be skipped.
   * @param {number} limit - Limit number of orders to be returned.
   * @returns {Promise<Order[]>}
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
 * @typedef Order
 */
export default mongoose.model('Order', OrderSchema);


