'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _pilot = require('../models/pilot.model');

var _pilot2 = _interopRequireDefault(_pilot);

var _manager = require('../models/manager.model');

var _manager2 = _interopRequireDefault(_manager);

var _customer = require('../models/customer.model');

var _customer2 = _interopRequireDefault(_customer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../../config/env');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
  _user2.default.getByUsername(req.body.username).then(function (user) {
    if (user.password === req.body.password) {
      if (req.body.userRole === 'PILOT') {
        _pilot2.default.getByUserId(user._id.toString()).then(function (pilot) {
          var token = _jsonwebtoken2.default.sign({
            username: user.username
          }, config.jwtSecret);
          pilot.userId.password = 'XXXXXXXXX';
          return res.json({
            token: token,
            username: user.username,
            pilotId: pilot._id,
            pilot: pilot
          });
        }).catch(function (e) {
          var err = new _APIError2.default('Authentication error', _httpStatus2.default.UNAUTHORIZED);
          return next(err);
        });
      } else if (req.body.userRole === 'MANAGER') {
        _manager2.default.getByUserId(user._id.toString()).then(function (manager) {
          var token = _jsonwebtoken2.default.sign({
            username: user.username
          }, config.jwtSecret);
          manager.user.password = 'XXXXXXXXX';
          return res.json({
            token: token,
            username: user.username,
            managerId: manager._id,
            manager: manager
          });
        }).catch(function (e) {
          var err = new _APIError2.default('Authentication error', _httpStatus2.default.UNAUTHORIZED);
          return next(err);
        });
      } else if (req.body.userRole === 'CUSTOMER') {
        _customer2.default.getByUserId(user._id.toString()).then(function (customer) {
          var token = _jsonwebtoken2.default.sign({
            username: user.username
          }, config.jwtSecret);
          customer.user.password = 'XXXXXXXXX';
          return res.json({
            token: token,
            username: user.username,
            customerId: customer._id,
            customer: customer
          });
        }).catch(function (e) {
          var err = new _APIError2.default('Authentication error', _httpStatus2.default.UNAUTHORIZED);
          return next(err);
        });
      }
    }
  }).catch(function (e) {
    var err = new _APIError2.default('Authentication error', _httpStatus2.default.UNAUTHORIZED);
    return next(err);
  });
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

exports.default = { login: login, getRandomNumber: getRandomNumber };
module.exports = exports['default'];
//# sourceMappingURL=auth.controller.js.map
