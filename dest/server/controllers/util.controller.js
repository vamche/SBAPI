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

var maxDistance = 3; // 3 KM


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
  _order2.default.getUnAssigned().then(function (orders) {
    console.info('Number of pending orders ' + orders.length);
    orders.forEach(function (order) {
      if (order.team !== null && order.team !== '' && order.team !== "*" && order.team !== "ALL") {
        _pilot2.default.findOne().where('isAvailable', true).where('teams').in([order.team]).where('franchise', order.franchise).where('isActive', false).where('location').near({
          center: order.from_location,
          maxDistance: maxDistance * 1000
        }).populate('user').then(function (pilot) {
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
              (0, _send.sendSMS)('91' + updatedOrder.to_phone, 'Hurray! Your delivery is on its way. Our member ' + pilot.user.firstName + ' (' + pilot.user.mobileNumber + ') will deliver it in short time.', 4);
              pilot.save();
            });
          }
        }).catch(function (e) {
          return console.error(e);
        });
      } else {
        _pilot2.default.findOne().where('isAvailable', true).where('isActive', false).where('franchise', order.franchise).where('location').near({
          center: order.from_location,
          maxDistance: maxDistance * 1000
        }).populate('user').then(function (pilot) {
          if (pilot && pilot._id && !pilot.isActive) {
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
              (0, _send.sendSMS)('91' + updatedOrder.to_phone, 'Hurray! Your delivery is on its way. Our member ' + pilot.user.firstName + ' (' + pilot.user.mobileNumber + ') will deliver it in short time.', 4);
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
  console.log('d ' + _geolib2.default.getPathLength(latLongs));
  return _geolib2.default.getPathLength(latLongs);
}

/**
 * Returns distance in meters
 * @param coordinates
 * @returns {*}
 */
function calculateDistancePickedToDelivery(timeline, orderPilotMovement) {

  for (i = 0; i < timeline.length; i++) {
    var status = timeline[i];
    if (status.indexOf('PICKED') > -1) {
      var lonLats = status[2].split(',');
      var pilot_movement = orderPilotMovement.coordinates;
      if (pilot_movement.length > 0) {
        var hash = {};
        for (var i = 0; i < pilot_movement.length; i += 1) {
          hash[pilot_movement[i]] = i;
        }
        console.log('out' + lonLats);
        if (hash.hasOwnProperty(lonLats)) {
          console.log('in' + lonLats);
          var d = calculateDistanceBetweenLatLongs(pilot_movement.slice(hash[lonLats], pilot_movement.length));
          return d;
        } else {
          return calculateDistanceBetweenLatLongs(pilot_movement);
        }
      } else {
        return 0;
      }
    }
  }
}

/**
 * Final Cost in INR
 * @param distance
 * @param timeInSeconds
 * @returns {number}
 */
function calculateFinalCost(distance, timeInSeconds) {
  var minDistance = 4500;
  var baseFare = 45;
  var finalCost = 0;
  var perKM = 10;
  var perHour = 10;
  var tax = 15;
  if (distance < minDistance) {
    finalCost = baseFare;
    finalCost += finalCost * (tax / 100);
  } else {
    finalCost = baseFare + (distance - minDistance) / 1000 * perKM; //+ ((timeInSeconds/3600)*perHour);
    finalCost += finalCost * (tax / 100);
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
  calculateDistanceBetweenLatLongs: calculateDistanceBetweenLatLongs, calculateDuration: calculateDuration, calculateFinalCost: calculateFinalCost,
  calculateDistancePickedToDelivery: calculateDistancePickedToDelivery };
module.exports = exports['default'];
//# sourceMappingURL=util.controller.js.map
