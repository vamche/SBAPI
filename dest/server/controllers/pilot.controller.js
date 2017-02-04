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

function updateLocation(req, res, next) {
  var pilot = req.pilot;
  pilot.location = req.body.location;
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

  var pilotsWithUserIds = [];
  _pilot2.default.list({ limit: limit, skip: skip }).then(function (pilots) {
    // pilotsWithUserIds = pilots;
    var updatedPilots = [];
    pilotsWithUserIds = pilots.map(function (pilot) {
      var x = void 0;
      var y = _user2.default.get(pilot.userId).then(function (user) {
        x = pilot;
        x.userId = JSON.stringify(user);
        updatedPilots.push(x);
        return x;
      });
      return y;
    });
    _bluebird2.default.all(pilotsWithUserIds).then(function () {
      return res.json(updatedPilots);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load, get: get, create: create, update: update, list: list, remove: remove, listOfPilotsWithUserDetails: listOfPilotsWithUserDetails, updateLocation: updateLocation, updateTeams: updateTeams };
module.exports = exports['default'];
//# sourceMappingURL=pilot.controller.js.map
