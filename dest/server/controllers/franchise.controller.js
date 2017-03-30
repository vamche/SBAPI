'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _franchise = require('../models/franchise.model');

var _franchise2 = _interopRequireDefault(_franchise);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load franchise and append to req.
 */
function load(req, res, next, id) {
  _franchise2.default.get(id).then(function (franchise) {
    req.franchise = franchise; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get franchise
 * @returns {Franchise}
 */
function get(req, res) {
  return res.json(req.franchise);
}

/**
 * Create new franchise
 * @property {string} req.body.username - The username of franchise.
 * @property {string} req.body.mobileNumber - The mobileNumber of franchise.
 * @returns {Franchise}
 */
function create(req, res, next) {
  var franchise = new _franchise2.default({
    name: req.body.name,
    teams: req.body.teams,
    location: req.body.location,
    geo_fence: req.body.geo_fence,
    description: req.body.description
  });

  franchise.save().then(function (savedFranchise) {
    return res.json(savedFranchise);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing franchise
 * @property {string} req.body.username - The username of franchise.
 * @property {string} req.body.mobileNumber - The mobileNumber of franchise.
 * @returns {Franchise}
 */
function update(req, res, next) {
  var franchise = req.franchise;
  franchise.teams = req.body.teams ? req.body.teams : franchise.teams;
  franchise.geo_fence = req.body.geo_fence ? req.body.geo_fence : franchise.geo_fence;
  franchise.name = req.body.name ? req.body.name : franchise.name;
  franchise.description = req.body.description ? req.body.description : franchise.description;
  franchise.location = req.body.location ? req.body.location : franchise.location;

  franchise.save().then(function (savedFranchise) {
    return res.json(savedFranchise);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get franchise list.
 * @property {number} req.query.skip - Number of Franchise to be skipped.
 * @property {number} req.query.limit - Limit number of Franchise to be returned.
 * @returns {Franchise[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _franchise2.default.list({ limit: limit, skip: skip }).then(function (franchises) {
    return res.json(franchises);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete franchise.
 * @returns {Franchise}
 */
function remove(req, res, next) {
  var franchise = req.franchise;
  franchise.remove().then(function (deletedFranchise) {
    return res.json(deletedFranchise);
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
  _franchise2.default.find().then(function (franchises) {
    promises = franchises.map(function (franchise) {
      var total = 0;
      var p = _order2.default.find().where('team').in(franchise.teams).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
        orders.forEach(function (order) {
          total = total + order.final_cost;
        });
        sales.push({
          '_id': franchise._id,
          'name': franchise.name,
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

function getSalesByFranchise(req, res, next) {
  var _req$body2 = req.body,
      _req$body2$fromDate = _req$body2.fromDate,
      fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
      _req$body2$toDate = _req$body2.toDate,
      toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}
  _order2.default.find().where('createdBy', req.franchise._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
    var total = 0;
    orders.forEach(function (order) {
      total = total + order.final_cost;
    });
    sales = {
      '_id': req.franchise._id,
      'name': req.franchise.name,
      'sales': total,
      'orders': orders
    };
    res.json(sales);
  }).catch(function (e) {
    return next(e);
  });
}

function findFranchiseContainingLocation(req, res, next) {

  _franchise2.default.findFranchiseContainingLocation(req.body.location).then(function (results) {
    return res.json(results);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load, get: get, create: create, update: update, list: list, remove: remove, getSales: getSales, getSalesByFranchise: getSalesByFranchise, findFranchiseContainingLocation: findFranchiseContainingLocation };
module.exports = exports['default'];
//# sourceMappingURL=franchise.controller.js.map
