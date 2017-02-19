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

function assign(order, pilotId) {
    return _pilot4.default.getUnAssignedPilotsByTeam(order.team).then(function (pilots) {
        if (pilots.length > 0) {
            var validPilots = pilots.filter(function (pilot) {
                return pilot._id != pilotId;
            });
            var pilot = validPilots[0];
            pilot.isActive = true;
            return pilot.save(pilot).then(function (pilot) {
                order.pilot = pilot._id.toString();
                return order.save(order);
            });
        } else {
            return order;
        }
    });
}

function unAssign(orderId, pilotId) {

    return _order2.default.get(orderId).then(function (order) {
        order.pilot = null;
        return order.save(order);
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

exports.default = { assign: assign, unAssign: unAssign, uploadImgAsync: uploadImgAsync };
module.exports = exports['default'];
//# sourceMappingURL=util.controller.js.map
