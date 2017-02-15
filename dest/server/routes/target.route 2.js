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

var _target = require('../controllers/target.controller');

var _target2 = _interopRequireDefault(_target);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/targets - Get list of targets */
.get(_target2.default.list)

/** POST /api/targets - Create new target */
.post((0, _expressValidation2.default)(_paramValidation2.default.createTarget), _target2.default.create);

router.route('/:targetId')
/** GET /api/targets/:targetId - Get target */
.get(_target2.default.get)

/** PUT /api/targets/:targetId - Update target */
.put(_target2.default.update)

/** DELETE /api/targets/:targetId - Delete target */
.delete((0, _expressValidation2.default)(_paramValidation2.default.updateTarget), _target2.default.remove);

/** Load target when API with targetId route parameter is hit */
router.param('targetId', _target2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=target.route.js.map
