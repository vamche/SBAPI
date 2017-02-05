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

var _util = require('../controllers/util.controller');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/assign/:orderId').put(_util2.default.assign);

/** Load order when API with orderId route parameter is hit */
router.param('orderId', _util2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=util.route.js.map
