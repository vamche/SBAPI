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
 * ADMIN
 * MANAGER
 * PILOT
 * MERCHANT
 * CUSTOMER
 */
var UserRoleSchema = new _mongoose2.default.Schema({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  previliges: {
    type: [_mongoose2.default.Schema.ObjectId],
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
});
//# sourceMappingURL=userRole.model.js.map
