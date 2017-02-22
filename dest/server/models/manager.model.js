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
 * Manager Schema
 */
var ManagerSchema = new _mongoose2.default.Schema({
  user: {
    type: String,
    ref: 'User',
    required: false
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
  franchise: {
    type: String,
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
 * @typedef Manager
 */
exports.default = _mongoose2.default.model('Manager', ManagerSchema);
module.exports = exports['default'];
//# sourceMappingURL=manager.model.js.map
