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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', function (req, res) {
  return res.send('OK');
});

// mount user routes at /users
router.use('/users', _user2.default);

// mount auth routes at /teams
router.use('/teams', _team2.default);

// mount auth routes at /teams
router.use('/pilots', _pilot2.default);

// mount auth routes at /teams
router.use('/orders', _order2.default);

// mount auth routes at /auth
router.use('/auth', _auth2.default);

// mount auth routes at /auth
router.use('/util', _auth2.default);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=index.route.js.map
