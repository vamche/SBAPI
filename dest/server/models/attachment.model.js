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
 * Attachment Schema
 */
var AttachmentSchema = new _mongoose2.default.Schema({
  source: {
    type: String,
    required: true
  },
  uploaded: {
    type: Boolean,
    required: true
  },
  order: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: false
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
AttachmentSchema.method({});

/**
 * Statics
 */
AttachmentSchema.statics = {
  /**
   * Get attachment
   * @param {ObjectId} id - The objectId of attachment.
   * @returns {Promise<Attachment, APIError>}
   */
  get: function get(id) {
    return this.findById(id).exec().then(function (attachment) {
      if (attachment) {
        return attachment;
      }
      var err = new _APIError2.default('No such attachment exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List attachments in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of attachments to be skipped.
   * @param {number} limit - Limit number of attachments to be returned.
   * @returns {Promise<Attachment[]>}
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
 * @typedef Attachment
 */
exports.default = _mongoose2.default.model('Attachment', AttachmentSchema);
module.exports = exports['default'];
//# sourceMappingURL=attachment.model.js.map
