'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _team = require('../models/team.model');

var _team2 = _interopRequireDefault(_team);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

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
    tags: req.body.tags,
    franchise: req.body.franchise ? req.body.franchise : null
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

  var franchise = req.body.franchise;
  _team2.default.list({ limit: limit, skip: skip, franchise: franchise }).then(function (teams) {
    return res.json(teams);
  }).catch(function (e) {
    return next(e);
  });
}

function listByFranchise(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === undefined ? 50 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;

  var franchise = req.body.franchise;
  _team2.default.list({ limit: limit, skip: skip, franchise: franchise }).then(function (teams) {
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

function getSales(req, res, next) {
  var _req$body = req.body,
      _req$body$fromDate = _req$body.fromDate,
      fromDate = _req$body$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$fromDate,
      _req$body$toDate = _req$body.toDate,
      toDate = _req$body$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$toDate;

  var sales = []; // Array of {_id: String, title: String, sales: String}
  var promises = void 0;
  var franchise = req.body.franchise;
  _team2.default.find().where('franchise', franchise).then(function (teams) {
    promises = teams.map(function (team) {
      var total = 0;
      var numberOfOrders = 0;
      var p = _order2.default.find().where('team', team._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
        orders.forEach(function (order) {
          total += order.final_cost;
          numberOfOrders++;
        });
        sales.push({
          '_id': team._id,
          'name': team.name,
          'sales': total,
          'orders': numberOfOrders
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

function getSalesByTeam(req, res, next) {
  var _req$body2 = req.body,
      _req$body2$fromDate = _req$body2.fromDate,
      fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
      _req$body2$toDate = _req$body2.toDate,
      toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}

  _order2.default.find().where('team', req.team._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
    var total = 0;
    orders.forEach(function (order) {
      total = total + order.final_cost;
    });
    sales = {
      '_id': req.team._id,
      'name': req.team.name,
      'sales': total
    };
    res.json(sales);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove, getSales: getSales, getSalesByTeam: getSalesByTeam, listByFranchise: listByFranchise };
module.exports = exports['default'];
//# sourceMappingURL=team.controller.js.map
