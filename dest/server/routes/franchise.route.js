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

var _franchise = require('../controllers/franchise.controller');

var _franchise2 = _interopRequireDefault(_franchise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/franchises - Get list of franchises */
.get(_franchise2.default.list)

/** POST /api/franchises - Create new franchise */
.post((0, _expressValidation2.default)(_paramValidation2.default.createFranchise), _franchise2.default.create);

router.route('/:franchiseId')
/** GET /api/franchises/:franchiseId - Get franchise */
.get(_franchise2.default.get)

/** PUT /api/franchises/:franchiseId - Update franchise */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateFranchise), _franchise2.default.update)

/** DELETE /api/franchises/:franchiseId - Delete franchise */
.delete(_franchise2.default.remove);

router.route('/sales')
/** GET /api/franchises/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_franchise2.default.getSales);

router.route('/sales/:franchiseId')
/** GET /api/franchises/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_franchise2.default.getSalesByFranchise);

router.route('/findFranchiseContainingLocation').post(_franchise2.default.findFranchiseContainingLocation);

/** Load franchise when API with franchiseId route parameter is hit */
router.param('franchiseId', _franchise2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=franchise.route.js.map
