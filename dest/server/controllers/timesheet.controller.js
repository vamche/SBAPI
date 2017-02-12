'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _timesheet = require('../models/timesheet.model');

var _timesheet2 = _interopRequireDefault(_timesheet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load timesheet and append to req.
 */
function load(req, res, next, id) {
    _timesheet2.default.get(id).then(function (timesheet) {
        req.timesheet = timesheet; // eslint-disable-line no-param-reassign
        return next();
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Get timesheet
 * @returns {Timesheet}
 */
function get(req, res) {
    return res.json(req.timesheet);
}

/**
 * Create new timesheet
 * @property {string} req.body.timesheetname - The timesheetname of timesheet.
 * @property {string} req.body.mobileNumber - The mobileNumber of timesheet.
 * @returns {Timesheet}
 */
function create(req, res, next) {
    var timesheet = new _timesheet2.default({
        isAvailable: req.body.isAvailable,
        location: req.body.location,
        pilot: req.body.pilot

    });

    timesheet.save().then(function (savedTimesheet) {
        return res.json(savedTimesheet);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Update existing timesheet
 * @property {string} req.body.timesheetname - The timesheetname of timesheet.
 * @property {string} req.body.mobileNumber - The mobileNumber of timesheet.
 * @returns {Timesheet}
 */
function update(req, res, next) {
    var timesheet = req.timesheet;
    timesheet.isAvailable = req.body.isAvailable ? req.body.isAvailable : timesheet.isAvailable;
    timesheet.location = req.body.location ? req.body.location : timesheet.location;
    timesheet.pilot = req.body.pilot ? req.body.pilot : timesheet.pilot;
    timesheet.save().then(function (savedTimesheet) {
        return res.json(savedTimesheet);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Get timesheet list.
 * @property {number} req.query.skip - Number of timesheets to be skipped.
 * @property {number} req.query.limit - Limit number of timesheets to be returned.
 * @returns {Timesheet[]}
 */
function list(req, res, next) {
    var _req$query = req.query,
        _req$query$limit = _req$query.limit,
        limit = _req$query$limit === undefined ? 1000 : _req$query$limit,
        _req$query$skip = _req$query.skip,
        skip = _req$query$skip === undefined ? 0 : _req$query$skip;

    _timesheet2.default.list({ limit: limit, skip: skip }).then(function (timesheets) {
        return res.json(timesheets);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Delete timesheet.
 * @returns {Timesheet}
 */
function remove(req, res, next) {
    var timesheet = req.timesheet;
    timesheet.remove().then(function (deletedTimesheet) {
        return res.json(deletedTimesheet);
    }).catch(function (e) {
        return next(e);
    });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove };
module.exports = exports['default'];
//# sourceMappingURL=timesheet.controller.js.map
