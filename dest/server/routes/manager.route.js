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

var _manager = require('../controllers/manager.controller');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap


router.route('/')
/** GET /api/managers - Get list of managers */
.get(_manager2.default.list)

/** POST /api/managers - Create new manager */
.post((0, _expressValidation2.default)(_paramValidation2.default.createManager), _manager2.default.create);

router.route('/:managerId')
/** GET /api/managers/:managerId - Get manager */
.get(_manager2.default.get)

/** PUT /api/managers/:managerId - Update manager */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateManager), _manager2.default.update)

/** DELETE /api/managers/:managerId - Delete manager */
.delete(_manager2.default.remove);

router.route('/sales')
/** GET /api/managers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_manager2.default.getSales);

router.route('/sales/:managerId')
/** GET /api/managers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_manager2.default.getSalesByManager);

/** Load manager when API with managerId route parameter is hit */
router.param('managerId', _manager2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=manager.route.js.map
