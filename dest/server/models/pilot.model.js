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
 * Pilot Schema
 */
var PilotSchema = new _mongoose2.default.Schema({
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
PilotSchema.method({});

/**
 * Statics
 */
PilotSchema.statics = {
  /**
   * Get pilot
   * @param {ObjectId} id - The objectId of pilot.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).populate('userId').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByUserId: function getByUserId(userId) {
    return this.findOne().where('userId', userId).populate('userId').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List pilots in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of pilots to be skipped.
   * @param {number} limit - Limit number of pilots to be returned.
   * @returns {Promise<Pilot[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().populate('userId').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef Pilot
 */
exports.default = _mongoose2.default.model('Pilot', PilotSchema);
module.exports = exports['default'];
//# sourceMappingURL=pilot.model.js.map
