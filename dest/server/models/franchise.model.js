'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ref;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Franchise Schema
 */
var FranchiseSchema = new _mongoose2.default.Schema((_ref = {
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: false
  },
  timeZone: {
    type: String,
    required: false,
    default: 'Asia/Kolkata'
  },
  currency: {
    type: String,
    required: false,
    default: 'INR'
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
  geo_fence: {
    type: {
      type: String,
      default: 'MultiPolygon'
    },
    coordinates: {
      type: [[[[Number]]]],
      default: [[[[78.4867, 17.3850]]]]
    },

    required: false
  },
  registration_status: {
    type: Boolean,
    required: false,
    default: true
  }
}, _defineProperty(_ref, 'timeZone', {
  type: String,
  default: 'Asia/KolKata'
}), _defineProperty(_ref, 'currency', {
  type: String,
  default: 'INR'
}), _defineProperty(_ref, 'createdAt', {
  type: Date,
  default: Date.now
}), _ref));

FranchiseSchema.index({ location: '2dsphere' });
FranchiseSchema.index({ geo_fence: '2dsphere' });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
FranchiseSchema.method({});

/**
 * Statics
 */
FranchiseSchema.statics = {
  /**
   * Get Franchise
   * @param {ObjectId} id - The objectId of Franchise.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).populate('user').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such franchise exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByUserId: function getByUserId(userId) {
    return this.findOne().where('user', userId).populate('user').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such franchise exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  findFranchiseContainingLocation: function findFranchiseContainingLocation(loc) {
    return this.find({
      geo_fence: {
        $nearSphere: {
          $geometry: loc,
          $maxDistance: 0
        }
      } }).exec();
  },


  /**
   * List Franchises in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Franchises to be skipped.
   * @param {number} limit - Limit number of Franchises to be returned.
   * @returns {Promise<Franchise[]>}
   */
  list: function list() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 50 : _ref2$limit;

    return this.find().populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByTeam: function listByTeam() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        team = _ref3.team,
        _ref3$skip = _ref3.skip,
        skip = _ref3$skip === undefined ? 0 : _ref3$skip,
        _ref3$limit = _ref3.limit,
        limit = _ref3$limit === undefined ? 50 : _ref3$limit;

    return this.find().where('teams').in([team]).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef Franchise
 */
exports.default = _mongoose2.default.model('Franchise', FranchiseSchema);
module.exports = exports['default'];
//# sourceMappingURL=franchise.model.js.map
