'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _attachment = require('../models/attachment.model');

var _attachment2 = _interopRequireDefault(_attachment);

var _send = require('../notifications/send');

var _util = require('./util.controller');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _manager = require('../models/manager.model');

var _manager2 = _interopRequireDefault(_manager);

var _pilot = require('../models/pilot.model');

var _pilot2 = _interopRequireDefault(_pilot);

var _customer2 = require('../models/customer.model');

var _customer3 = _interopRequireDefault(_customer2);

var _franchise = require('../models/franchise.model');

var _franchise2 = _interopRequireDefault(_franchise);

var _express = require('../../config/express');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

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

  if (req.body.createdByUserRole === 'CUSTOMER') {
    _franchise2.default.findFranchiseContainingLocation(req.body.from_location).then(function (results) {
      if (results.length !== 0) {
        createOrder(req, res, next, results[0]._id);
      } else {
        createOrder(req, res, next);
      }
    });
  } else {
    createOrder(req, res, next);
  }
}

function createOrder(req, res, next) {
  var franchise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var order = new _order2.default({
    title: req.body.title,
    description: req.body.description,
    from_name: req.body.from_name,
    from_phone: req.body.from_phone,
    from_email: req.body.from_email,
    from_address: req.body.from_address,
    from_location: req.body.from_location,
    from_date_time: req.body.from_date_time,
    from_landmark: req.body.from_landmark,
    to_name: req.body.to_name,
    to_phone: req.body.to_phone,
    to_email: req.body.to_email,
    to_address: req.body.to_address,
    to_location: req.body.to_location,
    to_date_time: req.body.to_date_time,
    to_landmark: req.body.to_landmark,
    paymentType: req.body.paymentType,
    status: req.body.pilot ? 'ASSIGNED' : 'PENDING',
    tags: req.body.tags,
    team: req.body.team,
    createdBy: req.body.createdBy,
    createdByUserRole: req.body.createdByUserRole,
    franchise: franchise ? franchise : req.body.franchise,
    value: req.body.value ? req.body.value : 0,
    pilot: req.body.pilot ? new _mongoose2.default.Types.ObjectId(req.body.pilot) : null
  });

  order.save().then(function (savedOrder) {
    if (savedOrder.pilot === null) {
      return (0, _util.assign)(savedOrder, null, franchise);
    } else {
      return savedOrder;
    }
  }).then(function (savedOrder) {
    _send.message.headings.en = savedOrder.id + "";
    _send.message.contents.en = 'New Order Placed. \nPick at ' + order.from_address;
    _send.message.data = savedOrder;
    if (savedOrder.pilot) {
      _send.message.filters = [{ 'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot.toString() }, { 'operator': 'OR' }, { 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];

      if (savedOrder.franchise) {
        _send.message.filters.push({ 'operator': 'OR' });
        _send.message.filters.push({ 'field': 'tag', 'key': 'manager', 'relation': '=',
          'value': savedOrder.franchise.toString() });
      }

      _pilot2.default.get(savedOrder.pilot).then(function (p) {

        p.isActive = true;
        p.save().then(function (savedPilot) {
          (0, _send.sendSMS)('91' + savedOrder.to_phone, 'Hurray! Your delivery is on its way. Our member ' + savedPilot.user.firstName + ' (' + savedPilot.user.mobileNumber + ') will deliver it in short time.', 4);

          _express.io && _express.io.emit('ORDER_ADDED', savedOrder);
          (0, _send.sendNotification)(_send.message);
          res.json(savedOrder);
        });
      }).catch(function (e) {
        return next(e);
      });
    } else {
      _send.message.filters = [{ 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];
      if (savedOrder.franchise) {
        _send.message.filters.push({ 'operator': 'OR' });
        _send.message.filters.push({ 'field': 'tag', 'key': 'manager', 'relation': '=',
          'value': savedOrder.franchise.toString() });
      }

      _express.io && _express.io.emit('ORDER_ADDED', savedOrder);
      (0, _send.sendNotification)(_send.message);
      res.json(savedOrder);
    }
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
  var oldPilotId = req.order.pilot;
  order.pilot = req.body.pilot ? req.body.pilot : null;
  order.team = req.body.team ? req.body.team : null;
  order.status = req.body.pilot ? 'ASSIGNED' : 'PENDING';
  order.save().then(function (savedOrder) {
    if (savedOrder.pilot) {
      _pilot2.default.get(savedOrder.pilot).then(function (newpilot) {
        newpilot.isActive = true;
        newpilot.save().then(function (updatedNewPilot) {
          if (oldPilotId && oldPilotId._id && oldPilotId._id.toString() !== savedOrder.pilot) {
            _pilot2.default.get(oldPilotId._id.toString()).then(function (oldPilot) {
              oldPilot.isActive = false;
              oldPilot.save().then(function (updatedOldPilot) {
                _send.message.headings.en = savedOrder.id + "";
                _send.message.contents.en = 'New Order Placed. \nPick at ' + savedOrder.from_address;
                _send.message.filters = [{ 'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot }, { 'operator': 'OR' }, { 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];
                if (savedOrder.franchise) {
                  _send.message.filters.push({ 'operator': 'OR' });
                  _send.message.filters.push({ 'field': 'tag', 'key': 'manager', 'relation': '=',
                    'value': savedOrder.franchise.toString() });
                }
                (0, _send.sendSMS)('91' + savedOrder.to_phone, 'Hurray! Your delivery is on its way. Our member ' + newpilot.user.firstName + ' (' + newpilot.user.mobileNumber + ') will deliver it in short time.', 4);

                _express.io && _express.io.emit('ORDER_UPDATED', savedOrder);
                (0, _send.sendNotification)(_send.message);

                res.json(savedOrder);
              }).catch(function (e) {
                return next(e);
              });
            });
          } else {
            res.json(savedOrder);
          }
        }).catch(function (e) {
          return next(e);
        });
      }).catch(function (e) {
        return next(e);
      });
    } else {
      res.json(savedOrder);
    }
  }).catch(function (e) {
    return next(e);
  });
}

function updateOrder(order) {
  return new Promise(function (resolve, reject) {
    _order2.default.get(order._id).then(function (o) {
      var tobeUpdatedOrder = o;
      var statusChanged = false;
      if (o.status !== order.status) {
        statusChanged = true;
      }
      tobeUpdatedOrder.status = order.status;
      tobeUpdatedOrder.timeline = order.timeline;
      tobeUpdatedOrder.pilot_movement = order.pilot_movement;
      tobeUpdatedOrder.pilot_from_date_time = order.pilot_start_date_time;
      tobeUpdatedOrder.pilot_from_date_time = order.pilot_from_date_time;
      tobeUpdatedOrder.pilot_to_date_time = order.pilot_to_date_time;
      tobeUpdatedOrder.pilot_completed_date_time = order.pilot_completed_date_time;
      tobeUpdatedOrder.cash_collected = order.pilot_completed_date_time;

      if (order.status === 'COMPLETED') {
        var distance = (0, _util.calculateDistanceBetweenLatLongs)(order.pilot_movement.coordinates);
        var duration = (0, _util.calculateDuration)(order.pilot_start_date_time, order.pilot_completed_date_time);
        var pickUpToDeliveryDistance = (0, _util.calculateDistancePickedToDelivery)(order.timeline, order.pilot_movement);
        tobeUpdatedOrder.distance_in_meters = +distance.toFixed(2);
        tobeUpdatedOrder.distance_picked_to_delivery_in_meters = +pickUpToDeliveryDistance.toFixed(2);
        tobeUpdatedOrder.time_in_seconds = duration;
        tobeUpdatedOrder.final_cost = +(0, _util.calculateFinalCost)(pickUpToDeliveryDistance, duration).toFixed(2);
      }

      var attachmentsTobeUploaded = order.attachments.filter(function (a) {
        return !a.uploaded;
      });
      tobeUpdatedOrder.attachments = order.attachments.filter(function (a) {
        return a.uploaded;
      });
      tobeUpdatedOrder.attachments = tobeUpdatedOrder.attachments.map(function (a) {
        return _mongoose2.default.Types.ObjectId(a._id);
      });

      var aPromises = attachmentsTobeUploaded.map(function (attachment) {
        return (0, _util.uploadImgAsync)("data:image/png;base64," + attachment.source).then(function (result) {
          var a = new _attachment2.default({
            source: result.url,
            uploaded: true,
            orderId: attachment.orderId,
            orderStatus: attachment.orderStatus,
            type: attachment.type,
            extension: attachment.extension
          });
          return a;
        }).then(function (a) {
          return a.save().then(function (savedAttachment) {
            tobeUpdatedOrder.attachments.push(savedAttachment._id);
          }).catch(function (e) {
            return reject(e);
          });
        }).catch(function (e) {
          return reject(e);
        });
      });

      _bluebird2.default.all(aPromises).then(function () {
        tobeUpdatedOrder.save().then(function (updatedOrder) {
          if (statusChanged) {
            _express.io && _express.io.emit('ORDER_UPDATED', updatedOrder);
            _send.message.filters = [{ 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];
            _send.message.contents.en = 'Order Update \n' + updatedOrder.title + '. \nStatus ' + updatedOrder.status + '.';
            _send.message.contents.en += updatedOrder.paymentType === 'COD' ? updatedOrder.cash_collected ? 'Pilot collected cash for the COD order.' : 'Pilot did not collect cash for the COD order.' : '';
            _send.message.headings.en = updatedOrder.id + "";
            if (updatedOrder.franchise) {
              _send.message.filters.push({ 'operator': 'OR' });
              _send.message.filters.push({ 'field': 'tag', 'key': 'manager', 'relation': '=',
                'value': updatedOrder.franchise.toString() });
            }

            if (updatedOrder.status === 'COMPLETED' && updatedOrder.createdByUserRole === 'CUSTOMER') {
              _send.message.filters.push({ 'operator': 'OR' });
              _send.message.filters.push({ 'field': 'tag', 'key': 'customer', 'relation': '=',
                'value': updatedOrder.createdBy });
            }

            (0, _send.sendNotification)(_send.message);
          }
          if (updatedOrder.pilot) {
            _pilot2.default.get(updatedOrder.pilot._id.toString()).then(function (pilot) {
              if (updatedOrder.status === 'COMPLETED') {
                pilot.isActive = false;
                pilot.save().then(function () {
                  resolve(updatedOrder);
                }).catch(function (e) {
                  return reject(e);
                });
              } else {
                resolve(updatedOrder);
              }
              if (statusChanged && updatedOrder.status === 'STARTED') {
                //sendSMS(`91${updatedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${pilot.user.firstName} (${pilot.user.mobileNumber}) will deliver it in short time.`, 4);
              }
            }).catch(function (e) {
              return reject(e);
            });
          }
        }).catch(function (e) {
          return reject(e);
        });
      }).catch(function (e) {
        return reject(e);
      });
    }).catch(function (e) {
      return reject(e);
    });
  });
}

function updateOrders(req, res, next) {
  var updatedOrders = [];
  var promises = req.body.orders.map(function (order) {
    return updateOrder(order).then(function (updatedOrder) {
      updatedOrder.attachments = [];
      updatedOrder.pilot = '';
      updatedOrder.team = '';
      updatedOrders.push(updatedOrder);
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
      limit = _req$query2$limit === undefined ? 100 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;
  var _req$body = req.body,
      pilot = _req$body.pilot,
      date = _req$body.date,
      timeZone = _req$body.timeZone;

  _order2.default.listByPilotAndDate({ pilot: pilot, date: date, timeZone: timeZone, limit: limit, skip: skip }).then(function (orders) {
    res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

function listByDate(req, res, next) {
  var _req$query3 = req.query,
      _req$query3$limit = _req$query3.limit,
      limit = _req$query3$limit === undefined ? 500 : _req$query3$limit,
      _req$query3$skip = _req$query3.skip,
      skip = _req$query3$skip === undefined ? 0 : _req$query3$skip;
  var _req$body2 = req.body,
      date = _req$body2.date,
      timeZone = _req$body2.timeZone;

  var franchise = req.body.franchise;

  if (franchise) {
    var customer = req.body.customer;
    _order2.default.listByFranchiseAndDate({ date: date, timeZone: timeZone, franchise: franchise, limit: limit, skip: skip }).then(function (orders) {
      return res.json(orders);
    }).catch(function (e) {
      return next(e);
    });
  } else if (req.body.manager) {
    _manager2.default.get(req.body.manager).then(function (manager) {
      if (manager.isAdmin) {
        _order2.default.listByDate({ date: date, timeZone: timeZone, limit: limit, skip: skip }).then(function (orders) {
          return res.json(orders);
        }).catch(function (e) {
          return next(e);
        });
      } else if (manager.isFranchiseAdmin) {
        _franchise2.default.find().where().then(function (franchise) {
          var teams = manager.teams;
          _order2.default.listByTeamsAndDate({ date: date, timeZone: timeZone, teams: teams, limit: limit, skip: skip }).where('team').in(franchise.teams).then(function (orders) {
            return res.json(orders);
          }).catch(function (e) {
            return next(e);
          });
        }).catch(function (e) {
          return next(e);
        });
      } else {
        var teams = manager.teams;
        _order2.default.listByTeamsAndDate({ date: date, timeZone: timeZone, teams: teams, limit: limit, skip: skip }).then(function (orders) {
          return res.json(orders);
        }).catch(function (e) {
          return next(e);
        });
      }
    });
  } else if (req.body.customer) {
    var _customer = req.body.customer;
    _order2.default.listByCustomerAndDate({ date: date, timeZone: timeZone, customer: _customer, limit: limit, skip: skip }).then(function (orders) {
      return res.json(orders);
    }).catch(function (e) {
      return next(e);
    });
  }
  // else {
  //    Order.listByDate({date, timeZone, limit, skip})
  //     .then(orders => res.json(orders))
  //     .catch(e => next(e));
  // }
}

function listByStatusPilotDateRange(req, res, next) {
  var _req$body3 = req.body,
      status = _req$body3.status,
      pilot = _req$body3.pilot,
      fromDate = _req$body3.fromDate,
      toDate = _req$body3.toDate;

  _order2.default.listByPilotDateRangeStatus({ pilot: pilot, fromDate: fromDate, toDate: toDate, status: status }).then(function (orders) {
    return res.json(orders);
  }).catch(function (e) {
    return next(e);
  });
}

function listByTeam(req, res, next) {
  var team = req.body.team;
  var date = req.body.date;
  _order2.default.listByTeamAndDate({ team: team, date: date }).then(function (orders) {
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
    var pilot = req.order.pilot;
    if (pilot) {
      _pilot2.default.get(pilot).then(function (oldPilot) {
        oldPilot.isActive = false;
        oldPilot.save().then(function (updatedOldPilot) {
          return res.json(deletedOrder);
        }).catch(function (e) {
          return next(e);
        });
      }).catch(function (e) {
        return next(e);
      });
    } else {
      res.json(deletedOrder);
    }
  }).catch(function (e) {
    return next(e);
  });
}

function stats(req, res, next) {
  var date = req.body.date;
  _order2.default.listByDate({ date: date }).then(function (orders) {
    var stats = {
      assigned: 0,
      unAssigned: 0,
      completed: 0,
      total: 0
    };
    orders.forEach(function (order) {
      if (order.status == "COMPLETED") {
        stats.completed++;
      } else if (order.pilot && order.pilot != '') {
        stats.assigned++;
      } else {
        stats.unAssigned++;
      }
      stats.total++;
    });
    res.json(stats);
  }).catch(function (e) {
    return next(e);
  });
}

function reject(req, res, next) {
  var order = req.order;
  var pilot = order.pilot.toString();
  order.status = 'PENDING';
  order.pilot = null;
  order.save().then(function (savedOrder) {
    return (0, _util.assign)(savedOrder, pilot);
  }).then(function (savedOrder) {
    _send.message.headings.en = savedOrder.id + "";
    _send.message.contents.en = 'New Order Assigned. \nPick at ' + savedOrder.from_address;
    _send.message.data = savedOrder;
    if (savedOrder.pilot) {
      _send.message.filters = [{ 'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot.toString() }, { 'operator': 'OR' }, { 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }];

      if (savedOrder.franchise) {
        _send.message.filters.push({ 'operator': 'OR' });
        _send.message.filters.push({ 'field': 'tag', 'key': 'manager', 'relation': '=',
          'value': savedOrder.franchise.toString() });
      }

      _pilot2.default.get(savedOrder.pilot).then(function (p) {

        p.isActive = true;
        p.save().then(function (savedPilot) {
          (0, _send.sendSMS)('91' + savedOrder.to_phone, 'Hurray! Your delivery is on its way. Our member ' + savedPilot.user.firstName + ' (' + savedPilot.user.mobileNumber + ') will deliver it in short time.', 4);

          _express.io && _express.io.emit('ORDER_UPDATED', savedOrder);
          (0, _send.sendNotification)(_send.message);
          _pilot2.default.get(pilot).then(function (oldPilot) {
            oldPilot.isActive = false;
            oldPilot.save().then(function () {
              return res.json(savedOrder);
            });
          }).catch(function (e) {
            return next(e);
          });
        });
      }).catch(function (e) {
        return next(e);
      });
    } else {
      _pilot2.default.get(pilot).then(function (oldPilot) {
        oldPilot.isActive = false;
        oldPilot.save().then(function () {
          return res.json(savedOrder);
        });
      }).catch(function (e) {
        return next(e);
      });
    }
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove, reject: reject,
  updateStatus: updateStatus, updatePilotMovement: updatePilotMovement, listByPilotAndDate: listByPilotAndDate, listByDate: listByDate, listByStatusPilotDateRange: listByStatusPilotDateRange, updateOrders: updateOrders,
  stats: stats, listByTeam: listByTeam };
module.exports = exports['default'];
//# sourceMappingURL=order.controller.js.map
