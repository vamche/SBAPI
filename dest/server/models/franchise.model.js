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
 * Franchise Schema
 */
var FranchiseSchema = new _mongoose2.default.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
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
  geo_fence: {
    type: {
      type: String,
      default: 'Polygon'
    },
    coordinates: [[Number]],
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


  /**
   * List Franchises in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Franchises to be skipped.
   * @param {number} limit - Limit number of Franchises to be returned.
   * @returns {Promise<Franchise[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByTeam: function listByTeam() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        team = _ref2.team,
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 50 : _ref2$limit;

    return this.find().where('teams').in([team]).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
};

/**
 * @typedef Franchise
 */
exports.default = _mongoose2.default.model('Franchise', FranchiseSchema);
module.exports = exports['default'];
//# sourceMappingURL=franchise.model.js.map
