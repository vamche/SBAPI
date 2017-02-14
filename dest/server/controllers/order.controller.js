'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _send = require('../notifications/send');

var _util = require('./util.controller');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load order and append to req.
 */
function load(req, res, next, id) {
  _order2.default.get(id).then(function (order) {
    req.order = order; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get order
 * @returns {Order}
 */
function get(req, res) {
  return res.json(req.order);
}

/**
 * Create new order
 * @property {string} req.body.username - The username of order.
 * @property {string} req.body.mobileNumber - The mobileNumber of order.
 * @returns {Order}
 */
function create(req, res, next) {
  var order = new _order2.default({
    title: req.body.title,
    description: req.body.description,
    from_name: req.body.from_name,
    from_phone: req.body.from_phone,
    from_email: req.body.from_email,
    from_address: req.body.from_address,
    from_location: req.body.from_location,
    from_date_time: req.body.from_date_time,
    to_name: req.body.to_name,
    to_phone: req.body.to_phone,
    to_email: req.body.to_email,
    to_address: req.body.to_address,
    to_location: req.body.to_location,
    to_date_time: req.body.to_date_time,
    paymentType: req.body.paymentType,
    status: req.body.status,
    tags: req.body.tags,
    team: req.body.team
  });

  order.save().then(function (savedOrder) {
    return (0, _util.assign)(savedOrder._id, savedOrder.team);
  }).then(function (savedOrder) {
    _send.message.contents.en = 'New Order Placed \n' + order.title + '. \nPick at ' + order.from_address + '.\n                              ';
    (0, _send.sendNotification)(_send.message);
    res.json(savedOrder);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing order
 * @property {string} req.body.username - The username of order.
 * @property {string} req.body.mobileNumber - The mobileNumber of order.
 * @returns {Order}
 */
function update(req, res, next) {
  var order = req.order;
  order.pilot = order.pilot;
  order.status = req.body.status;
  order.pilot_movement = req.body.pilot_movement;
  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).catch(function (e) {
    return next(e);
  });
}

function updateOrders(req, res, next) {
  var updatedOrders = [];
  var promises = req.body.orders.map(function (order) {
    return _order2.default.get(order._id).then(function (o) {
      o.pilot_movement = order.pilot_movement;
      return o.save().then(function (updatedOrder) {
        return updatedOrders.push(updatedOrder);
      }).catch(function (e) {
        return next(e);
      });
    }).catch(function (e) {
      return next(e);
    });
  });
  _bluebird2.default.all(promises).then(function () {
    return res.json(updatedOrders);
  }).catch(function (e) {
    return next(e);
  });
}

function updateStatus(req, res, next) {
  var order = req.order;
  var timeline = order.timeline;
  order.status = req.body.status;
  timeline.push([req.body.status, Date.now(), order.pilot]);
  order.timeline = timeline;
  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).then(function () {
    _send.message.contents.en = 'Order has been updated. It has been \n' + order.status + '.                              ';
    (0, _send.sendNotification)(_send.message);
  }).catch(function (e) {
    return next(e);
  });
}

function updatePilotMovement(req, res, next) {
  var order = req.order;
  order.pilot_movement = req.body.pilot_movement;
  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get order list.
 * @property {number} req.query.skip - Number of orders to be skipped.
 * @property {number} req.query.limit - Limit number of orders to be returned.
 * @returns {Order[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _order2.default.list({ limit: limit, skip: skip }).then(function (orders) {
    return res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

function listByPilotAndDate(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === undefined ? 50 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;
  var _req$body = req.body,
      pilot = _req$body.pilot,
      date = _req$body.date;

  _order2.default.listByPilotAndDate({ pilot: pilot, date: date, limit: limit, skip: skip }).then(function (orders) {
    return res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

function listByDate(req, res, next) {
  var _req$query3 = req.query,
      _req$query3$limit = _req$query3.limit,
      limit = _req$query3$limit === undefined ? 50 : _req$query3$limit,
      _req$query3$skip = _req$query3.skip,
      skip = _req$query3$skip === undefined ? 0 : _req$query3$skip;
  var date = req.body.date;

  _order2.default.listByDate({ date: date, limit: limit, skip: skip }).then(function (orders) {
    return res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

function listByStatusPilotDateRange(req, res, next) {
  var _req$body2 = req.body,
      status = _req$body2.status,
      pilot = _req$body2.pilot,
      fromDate = _req$body2.fromDate,
      toDate = _req$body2.toDate;

  _order2.default.listByPilotDateRangeStatus(pilot, fromDate, toDate, status).then(function (orders) {
    return res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete order.
 * @returns {Order}
 */
function remove(req, res, next) {
  var order = req.order;
  order.remove().then(function (deletedOrder) {
    return res.json(deletedOrder);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove,
  updateStatus: updateStatus, updatePilotMovement: updatePilotMovement, listByPilotAndDate: listByPilotAndDate, listByDate: listByDate, listByStatusPilotDateRange: listByStatusPilotDateRange, updateOrders: updateOrders };
module.exports = exports['default'];
//# sourceMappingURL=order.controller.js.map
