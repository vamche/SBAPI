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

var _pilot = require('../controllers/pilot.controller');

var _pilot2 = _interopRequireDefault(_pilot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap


router.route('/list')
/** GET /api/pliots/list - Get list of pilots with respective user details*/
.get(_pilot2.default.listOfPilotsWithUserDetails);

router.route('/')
/** GET /api/pilots - Get list of pilots */
.get(_pilot2.default.list)

/** POST /api/pilots - Create new pilot */
.post((0, _expressValidation2.default)(_paramValidation2.default.createPilot), _pilot2.default.create);

router.route('/:pilotId')
/** GET /api/pilots/:pilotId - Get pilot */
.get(_pilot2.default.get)

/** PUT /api/pilots/:pilotId - Update pilot */
.put((0, _expressValidation2.default)(_paramValidation2.default.updatePilot), _pilot2.default.update)

/** DELETE /api/pilots/:pilotId - Delete pilot */
.delete(_pilot2.default.remove);

router.route('/updateLocation/:pilotId').put(_pilot2.default.updatePilotLocation);

/** Load pilot when API with pilotId route parameter is hit */
router.param('pilotId', _pilot2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=pilot.route.js.map
