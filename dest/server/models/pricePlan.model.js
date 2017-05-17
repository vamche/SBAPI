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
 * PricePlan Schema
 */
var PricePlanSchema = new _mongoose2.default.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  baseFare: {
    type: Number,
    required: true
  },
  baseDistanceInKms: {
    type: Number,
    required: true
  },
  farePerExtraKm: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  applicableFor: {
    type: String,
    required: false,
    default: 'B2C'
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
PricePlanSchema.method({});

/**
 * Statics
 */
PricePlanSchema.statics = {
  /**
   * Get pricePlan
   * @param {ObjectId} id - The objectId of pricePlan.
   * @returns {Promise<PricePlan, APIError>}
   */
  get: function get(id) {
    return this.findById(id).populate('image').exec().then(function (pricePlan) {
      if (pricePlan) {
        return pricePlan;
      }
      var err = new _APIError2.default('No such pricePlan exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByName: function getByName(pricePlanname) {
    return this.findOne().where('pricePlanname', pricePlanname).populate('image').exec().then(function (pricePlan) {
      if (pricePlan) {
        return pricePlan;
      }
      var err = new _APIError2.default('No such pricePlan exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List pricePlans in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of pricePlans to be skipped.
   * @param {number} limit - Limit number of pricePlans to be returned.
   * @returns {Promise<PricePlan[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().populate('image').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef PricePlan
 */
exports.default = _mongoose2.default.model('PricePlan', PricePlanSchema);
module.exports = exports['default'];
//# sourceMappingURL=pricePlan.model.js.map
