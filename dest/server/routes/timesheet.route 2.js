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

var _timesheet = require('../controllers/timesheet.controller');

var _timesheet2 = _interopRequireDefault(_timesheet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/timesheets - Get list of timesheets */
.get(_timesheet2.default.list)

/** POST /api/timesheets - Create new timesheet */
.post((0, _expressValidation2.default)(_paramValidation2.default.createTimesheet), _timesheet2.default.create);

router.route('/:timesheetId')
/** GET /api/timesheets/:timesheetId - Get timesheet */
.get(_timesheet2.default.get)

/** PUT /api/timesheets/:timesheetId - Update timesheet */
.put(_timesheet2.default.update)

/** DELETE /api/timesheets/:timesheetId - Delete timesheet */
.delete(_timesheet2.default.remove);

/** Load timesheet when API with timesheetId route parameter is hit */
router.param('timesheetId', _timesheet2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=timesheet.route.js.map
