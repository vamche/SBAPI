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

var _team = require('../controllers/team.controller');

var _team2 = _interopRequireDefault(_team);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/list')
/** GET /api/teams - Get list of teams */
.post(_team2.default.listByFranchise);

router.route('/')
/** GET /api/teams - Get list of teams */
.get(_team2.default.list)

/** POST /api/teams - Create new team */
.post((0, _expressValidation2.default)(_paramValidation2.default.createTeam), _team2.default.create);

router.route('/:teamId')
/** GET /api/teams/:teamId - Get team */
.get(_team2.default.get)

/** PUT /api/teams/:teamId - Update team */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateTeam), _team2.default.update)

/** DELETE /api/teams/:teamId - Delete team */
.delete(_team2.default.remove);

router.route('/sales')
/** GET /api/teams/sales - Get sales by team and date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_team2.default.getSales);

router.route('/sales/:teamId')
/** GET /api/teams/sales - Get sales by team and date range
 * Params
 * { fromDate, toDate }
 * **/
.post(_team2.default.getSalesByTeam);

/** Load team when API with teamId route parameter is hit */
router.param('teamId', _team2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=team.route.js.map
