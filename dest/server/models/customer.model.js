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
 * Customer Schema
 */
var CustomerSchema = new _mongoose2.default.Schema({
  userId: {
    type: String,
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
    default: false
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
CustomerSchema.method({});

/**
 * Statics
 */
CustomerSchema.statics = {
  /**
   * Get Customer
   * @param {ObjectId} id - The objectId of Customer.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such customer exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByUserId: function getByUserId(userId) {
    return this.findOne().where('userId', userId).exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such customer exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List Customers in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Customers to be skipped.
   * @param {number} limit - Limit number of Customers to be returned.
   * @returns {Promise<Customer[]>}
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
 * @typedef Customer
 */
exports.default = _mongoose2.default.model('Customer', CustomerSchema);
module.exports = exports['default'];
//# sourceMappingURL=customer.model.js.map
