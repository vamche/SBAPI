'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pilot = require('../models/pilot.model');

var _pilot2 = _interopRequireDefault(_pilot);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _timesheet = require('../models/timesheet.model');

var _timesheet2 = _interopRequireDefault(_timesheet);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load pilot and append to req.
 */
function load(req, res, next, id) {
    _pilot2.default.get(id).then(function (pilot) {
        req.pilot = pilot; // eslint-disable-line no-param-reassign
        return next();
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Get pilot
 * @returns {Pilot}
 */
function get(req, res) {
    return res.json(req.pilot);
}

function getUnAssignedPilotsByTeam(team) {
    if (team == 'ALL' || team == '*') {
        return _pilot2.default.find().where('isActive', false);
    } else {
        return _pilot2.default.find().where('isActive', false).where('teams').in([team]);
    }
}

/**
 * Create new pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function create(req, res, next) {
    var pilotId = req.body.userId;
    var pilot = new _pilot2.default({
        userId: pilotId,
        teams: req.body.teams,
        location: req.body.location
    });

    pilot.save().then(function (savedPilot) {
        return res.json(savedPilot);
    }).catch(function (e) {
        return next(e);
    });
}

function createPilot(req, res, next) {

    var user = new _user2.default({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        mobileNumber: req.body.mobileNumber,
        emailAddress: req.body.emailAddress
    });

    user.save().then(function (savedUser) {
        var customer = new _pilot2.default({
            userId: savedUser._id,
            teams: req.body.teams,
            location: req.body.location
        });
        customer.save().then(function (savedCustomer) {
            res.json(savedCustomer);
        }).catch(function (e) {
            return next(e);
        });
    }).catch(function (e) {
        return next(e);
    });
}

function updateLocation(req, res, next) {
    var pilot = req.pilot;
    pilot.location = req.body.location;
    pilot.battery = req.body.battery;
    pilot.isAvailable = req.body.isAvailable;
    pilot.status = req.body.status;
    pilot.save().then(function (savedPilot) {
        return res.json(savedPilot);
    }).catch(function (e) {
        return next(e);
    });
}

function updateTeams(req, res, next) {
    var pilot = req.pilot;
    pilot.teams = req.body.teams;
    pilot.save().then(function (savedPilot) {
        return res.json(savedPilot);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Update existing pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function update(req, res, next) {
    var pilot = req.pilot;
    pilot.latitude = req.body.latitude;
    pilot.longitude = req.body.longitude;
    pilot.isActive = req.body.isActive;
    pilot.isAvailable = req.body.isAvailable;
    pilot.battery = req.pilot.battery;

    pilot.save().then(function (savedPilot) {
        return res.json(savedPilot);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function list(req, res, next) {
    var _req$query = req.query,
        _req$query$limit = _req$query.limit,
        limit = _req$query$limit === undefined ? 50 : _req$query$limit,
        _req$query$skip = _req$query.skip,
        skip = _req$query$skip === undefined ? 0 : _req$query$skip;

    _pilot2.default.list({ limit: limit, skip: skip }).then(function (pilots) {
        return res.json(pilots);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Delete pilot.
 * @returns {Pilot}
 */
function remove(req, res, next) {
    var pilot = req.pilot;
    pilot.remove().then(function (deletedPilot) {
        return res.json(deletedPilot);
    }).catch(function (e) {
        return next(e);
    });
}

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function listOfPilotsWithUserDetails(req, res, next) {
    var _req$query2 = req.query,
        _req$query2$limit = _req$query2.limit,
        limit = _req$query2$limit === undefined ? 100 : _req$query2$limit,
        _req$query2$skip = _req$query2.skip,
        skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;

    var promises = [];
    _pilot2.default.list({ limit: limit, skip: skip }).then(function (pilots) {
        // pilotsWithUserIds = pilots;
        var updatedPilots = [];
        promises = pilots.map(function (pilot) {
            var pilotToBeUpdated = void 0;
            var p = _user2.default.get(pilot.userId).then(function (user) {
                pilotToBeUpdated = pilot;
                pilotToBeUpdated.userId = JSON.stringify(user);
                updatedPilots.push(pilotToBeUpdated);
                return pilotToBeUpdated;
            });
            return p;
        });
        _bluebird2.default.all(promises).then(function () {
            return res.json(updatedPilots);
        }).catch(function (e) {
            return next(e);
        });
    }).catch(function (e) {
        return next(e);
    });
}

function getSales(req, res, next) {
    var _req$body = req.body,
        _req$body$fromDate = _req$body.fromDate,
        fromDate = _req$body$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$fromDate,
        _req$body$toDate = _req$body.toDate,
        toDate = _req$body$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$toDate;

    var sales = []; // Array of {_id: String, title: String, sales: String}
    var promises = void 0;
    _pilot2.default.find().then(function (pilots) {
        promises = pilots.map(function (pilot) {
            var total = 0;
            var p = _order2.default.find().where('pilot', pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
                orders.forEach(function (order) {
                    total = total + order.final_cost;
                });
                sales.push({
                    '_id': pilot._id,
                    'name': pilot.name,
                    'sales': total
                });
            }).catch(function (e) {
                return next(e);
            });
            return p;
        });
        _bluebird2.default.all(promises).then(function () {
            return res.json(sales);
        }).catch(function (e) {
            return next(e);
        });
    }).catch(function (e) {
        return next(e);
    });
}

function getSalesByPilot(req, res, next) {
    var _req$body2 = req.body,
        _req$body2$fromDate = _req$body2.fromDate,
        fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
        _req$body2$toDate = _req$body2.toDate,
        toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

    var sales = void 0; // {_id: String, title: String, sales: String}
    _order2.default.find().where('pilot', req.pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
        var total = 0;
        orders.forEach(function (order) {
            total = total + order.final_cost;
        });
        sales = {
            '_id': req.pilot._id,
            'name': req.pilot.name,
            'sales': total,
            'orders': orders
        };
        res.json(sales);
    }).catch(function (e) {
        return next(e);
    });
}

function getTimesheets(req, res, next) {
    var _req$body3 = req.body,
        _req$body3$fromDate = _req$body3.fromDate,
        fromDate = _req$body3$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$fromDate,
        _req$body3$toDate = _req$body3.toDate,
        toDate = _req$body3$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$toDate;

    var times = []; // Array of {_id: String, title: String, sales: String}
    var promises = void 0;
    _pilot2.default.find().then(function (pilots) {
        promises = pilots.map(function (pilot) {
            var total = 0;
            var p = _timesheet2.default.find().where('pilot', pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).sort({ createdAt: 1 }).then(function (timesheets) {
                var diff = 0;
                var len = 0;
                timesheets.forEach(function (timesheet) {
                    len++;
                    if (len === 1) {
                        if (timesheet.isAvailable) {
                            diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                        } else {
                            diff -= (0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').unix();
                            diff += (0, _moment2.default)(timesheet.createdAt).unix();
                        }
                    } else if (len === timesheets.length) {
                        if (!timesheet.isAvailable) {
                            diff += (0, _moment2.default)(timesheet.createdAt).unix();
                        } else {
                            diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                            if (toDate === (0, _moment2.default)().format('YYYYMMDD')) {
                                diff += (0, _moment2.default)().unix();
                            } else {
                                diff += (0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').unix();
                            }
                        }
                    } else {
                        if (timesheet.isAvailable) {
                            diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                        } else {
                            diff += (0, _moment2.default)(timesheet.createdAt).unix();
                        }
                    }
                });
                times.push({
                    '_id': pilot._id,
                    'name': pilot.name,
                    'time': diff / (60 * 60),
                    'timesheets': timesheets
                });
            }).catch(function (e) {
                return next(e);
            });
            return p;
        });
        _bluebird2.default.all(promises).then(function () {
            return res.json(times);
        }).catch(function (e) {
            return next(e);
        });
    }).catch(function (e) {
        return next(e);
    });
}

function getTimesheetsByPilot(req, res, next) {
    var _req$body4 = req.body,
        _req$body4$fromDate = _req$body4.fromDate,
        fromDate = _req$body4$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body4$fromDate,
        _req$body4$toDate = _req$body4.toDate,
        toDate = _req$body4$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body4$toDate;

    var sales = void 0; // {_id: String, title: String, sales: String}
    var times = void 0;
    _timesheet2.default.find().where('pilot', req.pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).sort({ createdAt: 1 }).then(function (timesheets) {
        var diff = 0;
        var len = 0;
        timesheets.forEach(function (timesheet) {
            len++;
            if (len === 1) {
                if (timesheet.isAvailable) {
                    diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                } else {
                    diff -= (0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').unix();
                    diff += (0, _moment2.default)(timesheet.createdAt).unix();
                }
            } else if (len === timesheets.length) {
                if (!timesheet.isAvailable) {
                    diff += (0, _moment2.default)(timesheet.createdAt).unix();
                } else {
                    diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                    if (toDate === (0, _moment2.default)().format('YYYYMMDD')) {
                        diff += (0, _moment2.default)().unix();
                    } else {
                        diff += (0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').unix();
                    }
                }
            } else {
                if (timesheet.isAvailable) {
                    diff -= (0, _moment2.default)(timesheet.createdAt).unix();
                } else {
                    diff += (0, _moment2.default)(timesheet.createdAt).unix();
                }
            }
        });
        times = {
            '_id': req.pilot._id,
            'name': req.pilot.name,
            'time': diff / (60 * 60),
            'timesheets': timesheets
        };
        res.json(times);
    }).catch(function (e) {
        return next(e);
    });
}

function stats(req, res, next) {
    var teams = [];
    var team = req.body.team;
    var getPilots = void 0;
    if (!team || team != "*") {
        teams = [team];
        getPilots = _pilot2.default.find().where('teams').in(teams);
    } else {
        getPilots = _pilot2.default.find();
    }
    getPilots.then(function (pilots) {
        var stats = {
            available: 0,
            offline: 0,
            total: 0
        };
        pilots.forEach(function (pilot) {
            if (pilot.isAvailable) {
                stats.available++;
            } else {
                stats.offline++;
            }
            stats.total++;
        });
        res.json(stats);
    }).catch(function (e) {
        return next(e);
    });
}

function listByTeam(req, res, next) {
    var team = req.body.team;
    _pilot2.default.find().where('teams').in([team]).then(function (pilots) {
        return res.json(pilots);
    }).catch(function (e) {
        return next(e);
    });
}

function updateAvailability(req, res, next) {
    var pilot = req.pilot;
    pilot.isAvailable = req.body.isAvailable;
    pilot.save().then(function (savedPilot) {
        var timesheet = new _timesheet2.default({
            isAvailable: req.body.isAvailable,
            pilot: savedPilot._id.toString(),
            location: req.body.location
        });
        timesheet.save().then(function (timesheet) {
            return res.json(timesheet);
        }).catch(function (e) {
            return next(e);
        });
    }).catch(function (e) {
        return next(e);
    });
}

exports.default = {
    load: load, get: get, create: create, update: update, list: list, remove: remove, listOfPilotsWithUserDetails: listOfPilotsWithUserDetails, updateLocation: updateLocation, updateTeams: updateTeams,
    getUnAssignedPilotsByTeam: getUnAssignedPilotsByTeam, createPilot: createPilot, getSales: getSales, getSalesByPilot: getSalesByPilot, getTimesheets: getTimesheets, getTimesheetsByPilot: getTimesheetsByPilot,
    stats: stats, listByTeam: listByTeam, updateAvailability: updateAvailability };
module.exports = exports['default'];
//# sourceMappingURL=pilot.controller.js.map
