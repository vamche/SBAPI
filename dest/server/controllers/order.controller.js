'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _send = require('../notifications/send');

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
    tags: req.body.tags
  });

  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).then(function () {
    _send.message.contents.en = 'New Order Placed \n' + order.title + '. \nPick at ' + order.from_address + '.\n                              ';
    (0, _send.sendNotification)(_send.message);
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
  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).catch(function (e) {
    return next(e);
  });
}

function updateStatus(req, res, next) {
  var order = req.order;
  order.status = req.body.status;
  order.save().then(function (savedOrder) {
    return res.json(savedOrder);
  }).then(function () {
    _send.message.contents.en = 'Order has been updated. It has been \n' + order.status + '.                              ';
    (0, _send.sendNotification)(_send.message);
  }).catch(function (e) {
    return next(e);
  });
}

function updateLocation(req, res, next) {
  var order = req.order;
  order.status = req.body.status;
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

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove, updateStatus: updateStatus, updateLocation: updateLocation };
module.exports = exports['default'];
//# sourceMappingURL=order.controller.js.map
