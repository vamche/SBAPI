'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manager = require('../models/manager.model');

var _manager2 = _interopRequireDefault(_manager);

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
 * Load manager and append to req.
 */
function load(req, res, next, id) {
  _manager2.default.get(id).then(function (manager) {
    req.manager = manager; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get manager
 * @returns {Manager}
 */
function get(req, res) {
  return res.json(req.manager);
}

/**
 * Create new manager
 * @property {string} req.body.username - The username of manager.
 * @property {string} req.body.mobileNumber - The mobileNumber of manager.
 * @returns {Manager}
 */
function create(req, res, next) {
  var manager = new _manager2.default({
    user: req.body.user,
    teams: req.body.teams,
    location: req.body.location
  });

  manager.save().then(function (savedManager) {
    return res.json(savedManager);
  }).catch(function (e) {
    return next(e);
  });
}

function createManager(req, res, next) {

  var user = new _user2.default({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress
  });

  user.save().then(function (savedUser) {
    var manager = new _manager2.default({
      user: savedUser._id,
      isAdmin: req.body.isAdmin,
      teams: req.body.teams,
      location: req.body.location,
      geoFence: req.body.geoFence
    });
    manager.save().then(function (savedManager) {
      res.json(savedManager);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function updateLocation(req, res, next) {
  var manager = req.manager;
  manager.location = req.body.location;
  manager.save().then(function (savedManager) {
    return res.json(savedManager);
  }).catch(function (e) {
    return next(e);
  });
}

function updateTeams(req, res, next) {
  var manager = req.manager;
  manager.teams = req.body.teams;
  manager.save().then(function (savedManager) {
    return res.json(savedManager);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing manager
 * @property {string} req.body.username - The username of manager.
 * @property {string} req.body.mobileNumber - The mobileNumber of manager.
 * @returns {Manager}
 */
function update(req, res, next) {
  var manager = req.manager;
  manager.save().then(function (savedManager) {
    return res.json(savedManager);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get manager list.
 * @property {number} req.query.skip - Number of Manager to be skipped.
 * @property {number} req.query.limit - Limit number of Manager to be returned.
 * @returns {Manager[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _manager2.default.list({ limit: limit, skip: skip }).then(function (managers) {
    return res.json(managers);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete manager.
 * @returns {Manager}
 */
function remove(req, res, next) {
  var manager = req.manager;
  manager.remove().then(function (deletedManager) {
    return res.json(deletedManager);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get manager list.
 * @property {number} req.query.skip - Number of Manager to be skipped.
 * @property {number} req.query.limit - Limit number of Manager to be returned.
 * @returns {Manager[]}
 */
function listOfManagersWithUserDetails(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === undefined ? 100 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;

  var managersWithUserIds = [];
  _manager2.default.list({ limit: limit, skip: skip }).then(function (managers) {
    // managersWithUserIds = managers;
    var updatedManagers = [];
    managersWithUserIds = managers.map(function (manager) {
      var x = void 0;
      var y = _user2.default.get(manager.user).then(function (user) {
        x = manager;
        x.user = JSON.stringify(user);
        updatedManagers.push(x);
        return x;
      });
      return y;
    });
    _bluebird2.default.all(managersWithUserIds).then(function () {
      return res.json(updatedManagers);
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
  _manager2.default.find().then(function (managers) {
    promises = managers.map(function (manager) {
      var total = 0;
      var p = _order2.default.find().where('createdBy', manager._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
        orders.forEach(function (order) {
          total = total + order.final_cost;
        });
        sales.push({
          '_id': manager._id,
          'name': manager.name,
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

function getSalesByManager(req, res, next) {
  var _req$body2 = req.body,
      _req$body2$fromDate = _req$body2.fromDate,
      fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
      _req$body2$toDate = _req$body2.toDate,
      toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}
  _order2.default.find().where('createdBy', req.manager._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
    var total = 0;
    orders.forEach(function (order) {
      total = total + order.final_cost;
    });
    sales = {
      '_id': req.manager._id,
      'name': req.manager.name,
      'sales': total,
      'orders': orders
    };
    res.json(sales);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load, get: get, create: create, update: update, list: list, remove: remove, listOfManagersWithUserDetails: listOfManagersWithUserDetails,
  updateLocation: updateLocation, updateTeams: updateTeams, createManager: createManager, getSales: getSales, getSalesByManager: getSalesByManager };
module.exports = exports['default'];
//# sourceMappingURL=manager.controller.js.map
