import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import autoIncrement from 'mongoose-auto-increment';

import APIError from '../helpers/APIError';

/**
 * Job Schema
 */
const OrderSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  value: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  team: {
    type: String, // mongoose.Schema.ObjectId,
    required: false,
    ref: 'Team',
    default: null
  },
  franchise: {
    type: String, // mongoose.Schema.ObjectId,
    ref: 'Franchise',
    default: null
  },
  pilot: {
    type: String, // mongoose.Schema.ObjectId,
    required: false,
    ref: 'Pilot',
    default: null
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
  from_landmark: {
    type: String,
    required: false
  },
  from_date_time: {
    type: Date,
    default: Date.now(),
    required: false
  },
  to_name: {
    type: String,
    required: false
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
  to_landmark: {
    type: String,
    required: false
  },
  to_date_time: {
    type: Date,
    default: Date.now(),
    required: false
  },
  timeZone: {
    type: Number,
    default: 530
  },
  attachments: {
    type: [{type: String, ref: 'Attachment'}],
    required: false,
    default: []
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
    type: [[String]], // [[ status, datetime, location ]]
    required: false,
    default: [[]]
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
    coordinates: [[Number]],

  },
  pilot_start_date_time: {
    type: Date,
    default: Date.now
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
  distance_picked_to_delivery_in_meters: {
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
    required: false,
    default: 'PREPAID'
  },
  createdByUserRole: {
    type: String,
    required: false
  },
  createdBy: {
    type: String, // merchant ID
    required: false,
    default: null
  },
  final_cost: {
    type: Number, // INR
    default: 0,
    required: false
  },
  payment_pending: {
    type: Boolean,
    default: true,
    required: false
  },
  cash_collected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.index({ from_location: '2dsphere' });
OrderSchema.index({ to_location: '2dsphere' });

autoIncrement.initialize(mongoose.connection);

OrderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'id',
  startAt: 1000000,
  incrementBy: 1
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
      .populate('attachments')
      .populate('team')
      .populate({
        path: 'pilot',
        populate: { path: 'user' }})
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
      .populate('attachments')
      .populate('team')
      .populate({
        path: 'pilot',
        populate: { path: 'user' }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByPilotAndDate({ pilot, date, timeZone = 'Europe/London' ,skip = 0, limit = 50 } = {}) {
    const diffInMinutes = moment().tz(timeZone).utcOffset();
    return this.find()
            .where('pilot', pilot)
            .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
                               .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
            .populate('attachments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
  },

  listByTeamAndDate({ team, date, skip = 0, limit = 1000 } = {}) {
    return this.find()
      .where('team', team)
      .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day')).lte(moment(date, "YYYYMMDD").endOf('day'))
      .populate('team')
      .populate('attachments')
      .populate({path: 'pilot',
                populate: { path: 'user' }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByDate({ date, timeZone = 'Europe/London', skip = 0, limit = 1000 } = {}) {
    const diffInMinutes = moment().tz(timeZone).utcOffset();
        return this.find()
            .where('franchise' , null)
            .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
                              .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
            .populate('attachments')
            .populate('team')
            .populate({
              path: 'pilot',
              populate: { path: 'user' }})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    },

  listByCustomerAndDate({ date, timeZone = 'Europe/London', customer, skip = 0, limit = 1000 } = {}) {
    const diffInMinutes = moment().tz(timeZone).utcOffset();
    return this.find()
      .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
      .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
      .where('createdBy', customer)
      .populate('attachments')
      .populate('team')
      .populate({
        path: 'pilot',
        populate: { path: 'user' }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByFranchiseAndDate({ date, timeZone = 'Europe/London', franchise = null, skip = 0, limit = 1000 } = {}) {
    const diffInMinutes = moment().tz(timeZone).utcOffset();
    return this.find()
      .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
      .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
      .where('franchise', franchise)
      .populate('attachments')
      .populate('team')
      .populate({
        path: 'pilot',
        populate: { path: 'user' }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByTeamsAndDate({ date, timeZone = 'Europe/London', teams, skip = 0, limit = 1000 } = {}) {
    const diffInMinutes = moment().tz(timeZone).utcOffset();
    return this.find()
      .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
      .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
      .where('team').in(teams)
      .populate('attachments')
      .populate('team')
      .populate('pilot')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  listByPilotDateRangeStatus({ pilot, fromDate, toDate, status } = {}){
      return this.find()
          .where('pilot', pilot)
          .where('status', status)
          .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
          .populate('attachments')
          .populate('pilot')
          .populate('team')
          .exec();
  },

  getUnAssigned() {
    return this.find()
      .or([{'status' : 'PENDING'}, {'pilot' : null}])
      .exec();
  }

};

/**
 * @typedef Order
 */
export default mongoose.model('Order', OrderSchema);
