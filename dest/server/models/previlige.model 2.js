'use strict';

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
 * UserRole Schema
 * ASSIGN_TASK
 * CREATE_PILOT
 * CREATE_TASK
 * CREATE_MANAGER
 * CUSTOMER
 */
var PrivilgeSchema = new _mongoose2.default.Schema({
  id: {
    type: Number,
    default: 0
  },
  title: {
    type: Number,
    default: 0
  },
  description: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
//# sourceMappingURL=previlige.model.js.map
