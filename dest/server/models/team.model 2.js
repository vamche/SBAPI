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
 * Team Schema
 */
var TeamSchema = new _mongoose2.default.Schema({
  id: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  tags: {
    type: [String],
    required: false
  },
  geo_fence: {
    type: {
      type: String,
      default: 'Polygon'
    },
    coordinates: [[Number]],
    required: false
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
TeamSchema.method({});

/**
 * Statics
 */
TeamSchema.statics = {
  /**
   * Get team
   * @param {ObjectId} id - The objectId of team.
   * @returns {Promise<Team, APIError>}
   */
  get: function get(id) {
    return this.findById(id).exec().then(function (team) {
      if (team) {
        return team;
      }
      var err = new _APIError2.default('No such team exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List teams in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of teams to be skipped.
   * @param {number} limit - Limit number of teams to be returned.
   * @returns {Promise<Team[]>}
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
 * @typedef Team
 */
exports.default = _mongoose2.default.model('Team', TeamSchema);
module.exports = exports['default'];
//# sourceMappingURL=team.model.js.map
