'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _paramValidation = require('../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _order = require('../controllers/order.controller');

var _order2 = _interopRequireDefault(_order);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/orders - Get list of orders */
.get(_order2.default.list)

/** POST /api/orders - Create new order */
.post((0, _expressValidation2.default)(_paramValidation2.default.createOrder), _order2.default.create);

router.route('/:orderId')
/** GET /api/orders/:orderId - Get order */
.get(_order2.default.get)

/** PUT /api/orders/:orderId - Update order */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateOrder), _order2.default.update)

/** DELETE /api/orders/:orderId - Delete order */
.delete(_order2.default.remove);

router.route('/list').post((0, _expressJwt2.default)({ secret: _env2.default.jwtSecret }), _order2.default.listByPilotAndDate);

router.route('/updateStatus/:orderId').put(_order2.default.updateStatus);

router.route('/updatePilotMovement/:orderId').put(_order2.default.updatePilotMovement);

/** Load order when API with orderId route parameter is hit */
router.param('orderId', _order2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=order.route.js.map
