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
 * Target Schema
 */
var TargetSchema = new _mongoose2.default.Schema({
    date: {
        type: String, // YYYYMMDD
        required: true,
        unique: true
    },
    createdBy: {
        type: String,
        required: false
    },
    target: {
        type: Number,
        required: true,
        default: 500
    },
    description: {
        type: String,
        required: false
    },
    actual: {
        type: Number,
        required: false,
        default: 0
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
TargetSchema.method({});

/**
 * Statics
 */
TargetSchema.statics = {
    /**
     * Get target
     * @param {ObjectId} id - The objectId of target.
     * @returns {Promise<Target, APIError>}
     */
    get: function get(id) {
        return this.findById(id).exec().then(function (target) {
            if (target) {
                return target;
            }
            var err = new _APIError2.default('No such target exists!', _httpStatus2.default.NOT_FOUND);
            return _bluebird2.default.reject(err);
        });
    },
    getByTargetname: function getByTargetname(targetname) {
        return this.findOne().where('targetname', targetname).exec().then(function (target) {
            if (target) {
                return target;
            }
            var err = new _APIError2.default('No such target exists!', _httpStatus2.default.NOT_FOUND);
            return _bluebird2.default.reject(err);
        });
    },


    /**
     * List targets in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of targets to be skipped.
     * @param {number} limit - Limit number of targets to be returned.
     * @returns {Promise<Target[]>}
     */
    list: function list() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$skip = _ref.skip,
            skip = _ref$skip === undefined ? 0 : _ref$skip,
            _ref$limit = _ref.limit,
            limit = _ref$limit === undefined ? 50 : _ref$limit;

        return this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }
};

/**
 * @typedef Target
 */
exports.default = _mongoose2.default.model('Target', TargetSchema);
module.exports = exports['default'];
//# sourceMappingURL=target.model.js.map
