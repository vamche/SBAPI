'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _pilot = require('../models/pilot.model');

var _pilot2 = _interopRequireDefault(_pilot);

var _order3 = require('../controllers/order.controller');

var _order4 = _interopRequireDefault(_order3);

var _pilot3 = require('../controllers/pilot.controller');

var _pilot4 = _interopRequireDefault(_pilot3);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _geolib = require('geolib');

var _geolib2 = _interopRequireDefault(_geolib);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _send = require('../notifications/send');

var _express = require('../../config/express');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maxDistance = 1000; // 1000 KM


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

function assign(order) {
  var pilotId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var franchise = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (order.team != null && order.team != '' && order.team != "*" && order.team != "ALL" && order.team != null) {
    return _pilot4.default.getUnAssignedPilotsByTeam(order.team, false, franchise).where('location').near({
      center: order.from_location,
      maxDistance: maxDistance * 1000
    }).then(function (pilots) {
      if (pilots.length > 0) {
        var validPilots = pilots.filter(function (pilot) {
          return pilot._id.toString() != pilotId;
        });
        var pilot = validPilots[0];
        pilot.isActive = true;
        return pilot.save(pilot).then(function (pilot) {
          order.pilot = pilot._id;
          return order.save();
        });
      } else {
        return order;
      }
    });
  } else {
    return order;
  }
}

function unAssign(orderId, pilotId) {
  return _order2.default.get(orderId).then(function (order) {
    order.pilot = null;
    return order.save().then(function (savedOrder) {
      assign(savedOrder, pilotId);
    });
  });
}

function uploadImgAsync(img) {
  return new Promise(function (resolve, reject) {
    _cloudinary2.default.v2.uploader.upload(img, function (err, res) {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

function assignPending() {
  var pilotIDs = [];
  _order2.default.getUnAssigned().then(function (orders) {
    console.info('Number of pending orders ' + orders.length);
    orders.forEach(function (order) {
      if (order.team !== null && order.team !== '' && order.team !== "*" && order.team !== "ALL") {
        _pilot2.default.findOne().where('isAvailable', true).where('teams').in([order.team]).where('franchise', order.franchise).where('isActive', false).where('location').near({
          center: order.to_location,
          maxDistance: maxDistance * 1000
        }).then(function (pilot) {
          if (pilot && pilot._id) {
            console.info('Pilot available and not null ' + pilot._id.toString());
            order.pilot = pilot._id;
            pilot.isActive = true;
            order.status = 'ASSIGNED';
            order.save().then(function (updatedOrder) {
              _send.message.headings.en = updatedOrder.id + "";
              _send.message.data = updatedOrder;
              _send.message.contents.en = 'Order Assigned \n' + updatedOrder.title + '. \n                                           \nPick at ' + updatedOrder.from_address;
              _send.message.filters = [{ 'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString() }, { 'operator': 'OR' }, { 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];
              _express.io && _express.io.emit('ORDER_UPDATED', updatedOrder);
              (0, _send.sendNotification)(_send.message);
              console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
              pilot.save();
            });
          }
        }).catch(function (e) {
          return console.error(e);
        });
      } else {
        _pilot2.default.find().where('isAvailable', true).where('isActive', false).where('franchise', order.franchise).where('location').near({
          center: order.to_location,
          maxDistance: maxDistance * 1000
        }).then(function (pilots) {
          var pilot = null;
          if (pilots.length) {
            var pilotSelected = false;
            var i = 0;
            while (!pilotSelected) {
              pilot = pilots[i];
              if (pilotIDs.indexOf(pilot._id.toString()) < 0) {
                pilotSelected = true;
              } else {
                i++;
              }
            }
          }
          if (pilot && pilot._id && pilotIDs.indexOf(pilot._id.toString()) < 0) {
            pilotIDs.push(pilot._id.toString());
            console.info('Pilot available and not null ' + pilot._id.toString());
            order.pilot = pilot._id;
            pilot.isActive = true;
            order.status = 'ASSIGNED';
            order.save().then(function (updatedOrder) {
              _send.message.headings.en = updatedOrder.id + "";
              _send.message.data = updatedOrder;
              _send.message.contents.en = ' Order Assigned \n' + updatedOrder.title + '. \n                    \nPick at ' + updatedOrder.from_address;
              _send.message.filters = [{ 'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString() }, { 'operator': 'OR' }, { 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];
              _express.io && _express.io.emit('ORDER_UPDATED', updatedOrder);
              (0, _send.sendNotification)(_send.message);
              console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
              pilot.save();
            });
          }
        }).catch(function (e) {
          return console.error(e);
        });
      }
    });
  });
}

/**
 * Returns distance in meters
 * @param coordinates
 * @returns {*}
 */
function calculateDistanceBetweenLatLongs(coordinates) {
  var latLongs = coordinates.map(function (coordinate) {
    return { latitude: coordinate[1],
      longitude: coordinate[0]
    };
  });
  return _geolib2.default.getPathLength(latLongs);
}

/**
 * Final Cost in INR
 * @param distance
 * @param timeInSeconds
 * @returns {number}
 */
function calculateFinalCost(distance, timeInSeconds) {
  var minDistance = 4000;
  var baseFare = 50;
  var finalCost = 0;
  var perKM = 10;
  var perHour = 10;
  if (distance < minDistance) {
    finalCost = baseFare;
  } else {
    finalCost = baseFare + (distance - minDistance) / 1000 * perKM + timeInSeconds / 3600 * perHour;
  }
  return finalCost;
}

/**
 * Returns duration in seconds
 * @param fromTime
 * @param toTime
 * @returns {number}
 */
function calculateDuration(fromTime, toTime) {
  return (0, _moment2.default)(toTime).diff((0, _moment2.default)(fromTime)) / 1000;
}

exports.default = { assign: assign, unAssign: unAssign, uploadImgAsync: uploadImgAsync, assignPending: assignPending,
  calculateDistanceBetweenLatLongs: calculateDistanceBetweenLatLongs, calculateDuration: calculateDuration, calculateFinalCost: calculateFinalCost };
module.exports = exports['default'];
//# sourceMappingURL=util.controller.js.map
