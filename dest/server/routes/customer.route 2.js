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

var _customer = require('../controllers/customer.controller');

var _customer2 = _interopRequireDefault(_customer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap


router.route('/list')
/** GET /api/pliots/list - Get list of customers with respective user details*/
.get(_customer2.default.listOfCustomersWithUserDetails);

router.route('/')
/** GET /api/customers - Get list of customers */
.get(_customer2.default.list)

/** POST /api/customers - Create new customer */
.post((0, _expressValidation2.default)(_paramValidation2.default.createCustomer), _customer2.default.create);

router.route('/:customerId')
/** GET /api/customers/:customerId - Get customer */
.get(_customer2.default.get)

/** PUT /api/customers/:customerId - Update customer */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateCustomer), _customer2.default.update)

/** DELETE /api/customers/:customerId - Delete customer */
.delete(_customer2.default.remove);

router.route('/create')

/** POST /api/customers - Create new customer */
.post(_customer2.default.createCustomer);

router.route('/updateLocation/:customerId').put(_customer2.default.updateLocation);

router.route('/updateTeams/:customerId').put(_customer2.default.updateTeams);

router.route('/sales')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_customer2.default.getSales);

router.route('/sales/:customerId')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_customer2.default.getSalesByCustomer);

/** Load customer when API with customerId route parameter is hit */
router.param('customerId', _customer2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=customer.route.js.map
