'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Timesheet Schema
 */
var TimesheetSchema = new _mongoose2.default.Schema({
    isAvailable: {
        type: Boolean,
        required: true
    },
    pilot: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TimesheetSchema.method({});

/**
 * Statics
 */
TimesheetSchema.statics = {
    /**
     * Get timesheet
     * @param {ObjectId} id - The objectId of timesheet.
     * @returns {Promise<Timesheet, APIError>}
     */
    get: function get(id) {
        return this.findById(id).exec().then(function (timesheet) {
            if (timesheet) {
                return timesheet;
            }
            var err = new _APIError2.default('No such timesheet exists!', _httpStatus2.default.NOT_FOUND);
            return _bluebird2.default.reject(err);
        });
    },


    /**
      * List timesheets in descending order of 'createdAt' timestamp.
      * @param {number} skip - Number of timesheets to be skipped.
      * @param {number} limit - Limit number of timesheets to be returned.
      * @returns {Promise<Timesheet[]>}
      */
    list: function list() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$skip = _ref.skip,
            skip = _ref$skip === undefined ? 0 : _ref$skip,
            _ref$limit = _ref.limit,
            limit = _ref$limit === undefined ? 50 : _ref$limit,
            _ref$franchise = _ref.franchise,
            franchise = _ref$franchise === undefined ? null : _ref$franchise;

        return this.find().where('franchise', franchise).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }
};

/**
 * @typedef Timesheet
 */
exports.default = _mongoose2.default.model('Timesheet', TimesheetSchema);
module.exports = exports['default'];
//# sourceMappingURL=timesheet.model.js.map
