'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customer = require('../models/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _printer = require('pdfmake/src/printer');

var _printer2 = _interopRequireDefault(_printer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');

/**
 * Load customer and append to req.
 */
function load(req, res, next, id) {
  _customer2.default.get(id).then(function (customer) {
    req.customer = customer; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get customer
 * @returns {Customer}
 */
function get(req, res) {
  return res.json(req.customer);
}

/**
 * Create new customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function create(req, res, next) {
  var user = new _user2.default({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress
  });

  user.save().then(function (savedUser) {
    var customer = new _customer2.default({
      user: savedUser._id,
      isMerchant: req.body.isMerchant,
      teams: req.body.teams,
      location: req.body.location,
      address: req.body.address,
      name: req.body.name,
      franchise: req.body.franchise ? req.body.franchise : null
    });
    customer.save().then(function (savedCustomer) {
      res.json(savedCustomer);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function createCustomer(req, res, next) {

  var user = new _user2.default({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress
  });

  user.save().then(function (savedUser) {
    var customer = new _customer2.default({
      user: savedUser._id,
      isMerchant: req.body.isMerchant,
      teams: req.body.teams,
      location: req.body.location,
      name: req.body.name
    });
    customer.save().then(function (savedCustomer) {
      res.json(savedCustomer);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function updateLocation(req, res, next) {
  var customer = req.customer;
  customer.location = req.body.location;
  customer.save().then(function (savedCustomer) {
    return res.json(savedCustomer);
  }).catch(function (e) {
    return next(e);
  });
}

function updateTeams(req, res, next) {
  var customer = req.customer;
  customer.teams = req.body.teams;
  customer.save().then(function (savedCustomer) {
    return res.json(savedCustomer);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function update(req, res, next) {
  var customer = req.customer;

  customer.save().then(function (savedCustomer) {
    return res.json(savedCustomer);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _customer2.default.list({ limit: limit, skip: skip }).then(function (customers) {
    return res.json(customers);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete customer.
 * @returns {Customer}
 */
function remove(req, res, next) {
  var customer = req.customer;
  customer.remove().then(function (deletedCustomer) {
    return res.json(deletedCustomer);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function listOfCustomersWithUserDetails(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === undefined ? 100 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;

  var customersWithUserIds = [];
  _customer2.default.list({ limit: limit, skip: skip }).then(function (customers) {
    // customersWithUserIds = customers;
    var updatedCustomers = [];
    customersWithUserIds = customers.map(function (customer) {
      var x = void 0;
      var y = _user2.default.get(customer.user).then(function (user) {
        x = customer;
        x.user = JSON.stringify(user);
        updatedCustomers.push(x);
        return x;
      });
      return y;
    });
    _bluebird2.default.all(customersWithUserIds).then(function () {
      return res.json(updatedCustomers);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function getSales(req, res, next) {
  var _req$body = req.body,
      franchise = _req$body.franchise,
      _req$body$fromDate = _req$body.fromDate,
      fromDate = _req$body$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$fromDate,
      _req$body$toDate = _req$body.toDate,
      toDate = _req$body$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$toDate,
      _req$body$timeZone = _req$body.timeZone,
      timeZone = _req$body$timeZone === undefined ? 'Europe/London' : _req$body$timeZone;

  var diffInMinutes = (0, _moment2.default)().tz(timeZone).utcOffset();

  var sales = []; // Array of {_id: String, title: String, sales: String}
  var promises = void 0;
  _customer2.default.find().where('franchise', franchise).then(function (customers) {
    promises = customers.map(function (customer) {
      var totalSales = 0;
      var totalDistance = 0;
      var p = _order2.default.find().where('franchise', franchise).where('createdBy', customer._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).then(function (orders) {
        orders.forEach(function (order) {
          totalSales = totalSales + order.final_cost;
          totalDistance = totalDistance + order.distance_in_meters;
        });
        sales.push({
          '_id': customer._id,
          'name': customer.name,
          'sales': totalSales,
          'distance': totalDistance
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

function getSalesByCustomer(req, res, next) {
  var _req$body2 = req.body,
      _req$body2$fromDate = _req$body2.fromDate,
      fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
      _req$body2$toDate = _req$body2.toDate,
      toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}
  _order2.default.find().where('createdBy', req.customer._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
    var total = 0;
    orders.forEach(function (order) {
      total = total + order.final_cost;
    });
    sales = {
      '_id': req.customer._id,
      'name': req.customer.name,
      'sales': total,
      'orders': orders
    };
    res.json(sales);
  }).catch(function (e) {
    return next(e);
  });
}

function getReport(req, res, next) {

  var customer = req.customer;
  var _req$body3 = req.body,
      franchise = _req$body3.franchise,
      _req$body3$fromDate = _req$body3.fromDate,
      fromDate = _req$body3$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$fromDate,
      _req$body3$toDate = _req$body3.toDate,
      toDate = _req$body3$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$toDate,
      _req$body3$timeZone = _req$body3.timeZone,
      timeZone = _req$body3$timeZone === undefined ? 'Europe/London' : _req$body3$timeZone;

  var diffInMinutes = (0, _moment2.default)().tz(timeZone).utcOffset();

  var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

  var printer = new _printer2.default(fonts);

  var docDefinition = {
    info: {
      title: 'Customer Report'
    },
    content: [{ text: 'Season Boy', style: 'header' }, 'Franchise:' + (customer.franchise ? customer.franchise.name : ''), '\n', customer.user.firstName + ' ' + customer.user.lastName, 'Mobile: ' + customer.user.mobileNumber, '\n', 'From date: ' + (0, _moment2.default)(fromDate, "YYYYMMDD").format('MMMM Do YYYY'), 'To date: ' + (0, _moment2.default)(toDate, "YYYYMMDD").format('MMMM Do YYYY'), '\n \n'],
    styles: {
      header: { fontSize: 20, bold: true }
    }
  };

  _order2.default.find().where('createdBy', customer._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).then(function (orders) {

    var orderRows = [];
    var totalDistance = 0;
    var totalCost = 0;

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];

      totalDistance += order.distance_in_meters;
      totalCost += order.final_cost;

      orderRows.push([order.id ? order.id : 'NA', order.paymentType ? order.paymentType : 'NA', (order.distance_in_meters / 1000).toFixed(2) + ' Kms', order.final_cost.toFixed(2)]);
    }

    var ordersContent = {
      style: 'tableExample',
      table: {
        widths: [100, 100, '*', '*'],
        body: [['Order id', 'Payment Type', 'Distance (Kms)', 'Cost (INR)']]
      }
    };

    ordersContent.table.body = ordersContent.table.body.concat(orderRows);
    docDefinition['content'].push(ordersContent);

    docDefinition['content'].push('\nTotal cost: Rs ' + totalCost.toFixed());
    docDefinition['content'].push('\nTotal Kms: ' + (totalDistance / 1000).toFixed(2) + ' Kms');
    docDefinition['content'].push('\nNumber of orders: ' + orders.length);

    var fileName = 'reports/' + 'Customer' + 'Report' + '.pdf';

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(fileName)).on('finish', function () {
      res.download(fileName);
    });

    pdfDoc.end();
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load, get: get, create: create, update: update, list: list, remove: remove, listOfCustomersWithUserDetails: listOfCustomersWithUserDetails,
  updateLocation: updateLocation, updateTeams: updateTeams, createCustomer: createCustomer, getSales: getSales, getSalesByCustomer: getSalesByCustomer, getReport: getReport };
module.exports = exports['default'];
//# sourceMappingURL=customer.controller.js.map
