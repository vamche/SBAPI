'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Job Schema
 */
var OrderSchema = new _mongoose2.default.Schema({
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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'The value of path {PATH} ({VALUE}) is not a valid email address'],
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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'The value of path {PATH} ({VALUE}) is not a valid email address'],
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
OrderSchema.method({});

/**
 * Statics
 */
OrderSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List orders in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of orders to be skipped.
   * @param {number} limit - Limit number of orders to be returned.
   * @returns {Promise<Order[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef Order
 */
exports.default = _mongoose2.default.model('Order', OrderSchema);
module.exports = exports['default'];
//# sourceMappingURL=order.model.js.map
