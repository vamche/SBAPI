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

var _mongooseAutoIncrement = require('mongoose-auto-increment');

var _mongooseAutoIncrement2 = _interopRequireDefault(_mongooseAutoIncrement);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Pilot Schema
 */
var PilotSchema = new _mongoose2.default.Schema({
  id: {
    type: Number,
    default: 0
  },
  user: {
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
  isTeamSpecific: {
    type: Boolean,
    default: false
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
  franchise: {
    type: String, // mongoose.Schema.ObjectId,
    ref: 'Franchise',
    default: null
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
    coordinates: {
      type: [Number],
      default: [78.4867, 17.3850]
    }
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
    required: false,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PilotSchema.index({ location: '2dsphere' });

_mongooseAutoIncrement2.default.initialize(_mongoose2.default.connection);

PilotSchema.plugin(_mongooseAutoIncrement2.default.plugin, {
  model: 'Pilot',
  field: 'id',
  startAt: 1000,
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
    return this.findById(id).populate('user').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByUserId: function getByUserId(userId) {
    return this.findOne().where('user', userId).populate('user').exec().then(function (order) {
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

    return this.find().populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByFranchise: function listByFranchise() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 50 : _ref2$limit,
        franchise = _ref2.franchise;

    return this.find().where('franchise', franchise).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef Pilot
 */
exports.default = _mongoose2.default.model('Pilot', PilotSchema);
module.exports = exports['default'];
//# sourceMappingURL=pilot.model.js.map
