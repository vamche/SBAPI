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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var customer = new _customer2.default({
        userId: req.body.userId,
        teams: req.body.teams,
        location: req.body.location
    });

    customer.save().then(function (savedCustomer) {
        return res.json(savedCustomer);
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
            userId: savedUser._id.toString(),
            isMerchant: req.body.isMerchant,
            teams: req.body.teams,
            location: req.body.location
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
            var y = _user2.default.get(customer.userId).then(function (user) {
                x = customer;
                x.userId = JSON.stringify(user);
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
        _req$body$fromDate = _req$body.fromDate,
        fromDate = _req$body$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$fromDate,
        _req$body$toDate = _req$body.toDate,
        toDate = _req$body$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$toDate;

    var sales = []; // Array of {_id: String, title: String, sales: String}
    var promises = void 0;
    _customer2.default.find().then(function (customers) {
        promises = customers.map(function (customer) {
            var total = 0;
            var p = _order2.default.find().where('createdBy', customer._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
                orders.forEach(function (order) {
                    total = total + order.final_cost;
                });
                sales.push({
                    '_id': customer._id,
                    'name': customer.name,
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

exports.default = {
    load: load, get: get, create: create, update: update, list: list, remove: remove, listOfCustomersWithUserDetails: listOfCustomersWithUserDetails,
    updateLocation: updateLocation, updateTeams: updateTeams, createCustomer: createCustomer, getSales: getSales, getSalesByCustomer: getSalesByCustomer };
module.exports = exports['default'];
//# sourceMappingURL=customer.controller.js.map
