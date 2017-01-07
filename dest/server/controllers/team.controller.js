'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _team = require('../models/team.model');

var _team2 = _interopRequireDefault(_team);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load team and append to req.
 */
function load(req, res, next, id) {
  _team2.default.get(id).then(function (team) {
    req.team = team; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get team
 * @returns {Team}
 */
function get(req, res) {
  return res.json(req.team);
}

/**
 * Create new team
 * @property {string} req.body.name - The name of team.
 * @property {string} req.body.tags - The tags of team.
 * @returns {Team}
 */
function create(req, res, next) {
  var team = new _team2.default({
    name: req.body.name,
    tags: req.body.tags
  });

  team.save().then(function (savedTeam) {
    return res.json(savedTeam);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing team
 * @property {string} req.body.username - The username of team.
 * @property {string} req.body.mobileNumber - The mobileNumber of team.
 * @returns {Team}
 */
function update(req, res, next) {
  var team = req.team;
  team.name = req.body.name;
  team.tags = req.body.tags;

  team.save().then(function (savedTeam) {
    return res.json(savedTeam);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get team list.
 * @property {number} req.query.skip - Number of teams to be skipped.
 * @property {number} req.query.limit - Limit number of teams to be returned.
 * @returns {Team[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _team2.default.list({ limit: limit, skip: skip }).then(function (teams) {
    return res.json(teams);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete team.
 * @returns {Team}
 */
function remove(req, res, next) {
  var team = req.team;
  team.remove().then(function (deletedTeam) {
    return res.json(deletedTeam);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove };
module.exports = exports['default'];
//# sourceMappingURL=team.controller.js.map
