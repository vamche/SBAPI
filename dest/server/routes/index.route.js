'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _user = require('./user.route');

var _user2 = _interopRequireDefault(_user);

var _team = require('./team.route');

var _team2 = _interopRequireDefault(_team);

var _pilot = require('./pilot.route');

var _pilot2 = _interopRequireDefault(_pilot);

var _order = require('./order.route');

var _order2 = _interopRequireDefault(_order);

var _auth = require('./auth.route');

var _auth2 = _interopRequireDefault(_auth);

var _customer = require('./customer.route');

var _customer2 = _interopRequireDefault(_customer);

var _timesheet = require('./timesheet.route');

var _timesheet2 = _interopRequireDefault(_timesheet);

var _target = require('./target.route');

var _target2 = _interopRequireDefault(_target);

var _manager = require('./manager.route');

var _manager2 = _interopRequireDefault(_manager);

var _franchise = require('./franchise.route');

var _franchise2 = _interopRequireDefault(_franchise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', function (req, res) {
  return res.send('OK');
});

// mount user routes at /users
router.use('/users', _user2.default);

// mount team routes at /teams
router.use('/teams', _team2.default);

// mount pilot routes at /pilots
router.use('/pilots', _pilot2.default);

// mount order routes at /orders
router.use('/orders', _order2.default);

// mount auth routes at /auth
router.use('/auth', _auth2.default);

// mount util routes at /util
router.use('/util', _auth2.default);

// mount customer routes at /customers
router.use('/customers', _customer2.default);

// mount timesheet routes at /timesheets
router.use('/timesheets', _timesheet2.default);

// mount target routes at /targets
router.use('/targets', _target2.default);

// mount manager routes at /managers
router.use('/managers', _manager2.default);

// mount franchise routes at /franchises
router.use('/franchises', _franchise2.default);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=index.route.js.map
