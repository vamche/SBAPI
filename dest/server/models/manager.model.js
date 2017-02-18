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
 * Manager Schema
 */
var ManagerSchema = new _mongoose2.default.Schema((_ref = {
  user: {
    type: String,
    ref: 'User',
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
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  isFranchiseAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  franchises: {
    type: [String],
    required: false
  }
}, _defineProperty(_ref, 'teams', {
  type: [String],
  required: false
}), _defineProperty(_ref, 'registration_status', {
  type: Boolean,
  required: false,
  default: true
}), _defineProperty(_ref, 'createdAt', {
  type: Date,
  default: Date.now
}), _ref));

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ManagerSchema.method({});

/**
 * Statics
 */
ManagerSchema.statics = {
  /**
   * Get Manager
   * @param {ObjectId} id - The objectId of Manager.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).populate('user').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such manager exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  getByUserId: function getByUserId(userId) {
    return this.findOne().where('user', userId).populate('user').exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such manager exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List Managers in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of Managers to be skipped.
   * @param {number} limit - Limit number of Managers to be returned.
   * @returns {Promise<Manager[]>}
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
 * @typedef Manager
 */
exports.default = _mongoose2.default.model('Manager', ManagerSchema);
module.exports = exports['default'];
//# sourceMappingURL=manager.model.js.map
