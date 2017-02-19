'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _attachment = require('../models/attachment.model');

var _attachment2 = _interopRequireDefault(_attachment);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load attachment and append to req.
 */
function load(req, res, next, id) {
  _attachment2.default.get(id).then(function (attachment) {
    req.attachment = attachment; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get attachment
 * @returns {Attachment}
 */
function get(req, res) {
  return res.json(req.attachment);
}

/**
 * Create new attachment
 * @property {string} req.body.name - The name of attachment.
 * @property {string} req.body.tags - The tags of attachment.
 * @returns {Attachment}
 */
function create(req, res, next) {
  if (!req.body.uploaded) {
    _cloudinary2.default.uploader.upload("data:image/png;base64," + req.body.source, function (result) {
      var attachment = new _attachment2.default({
        source: result.url,
        uploaded: true,
        orderId: req.body.orderId,
        orderStatus: req.body.orderStatus,
        type: req.body.type,
        extension: req.body.extension
      });
      attachment.save().then(function (savedAttachment) {
        return res.json(savedAttachment);
      }).catch(function (e) {
        return next(e);
      });
    }).catch(function (e) {
      return next(e);
    });
  } else {
    var attachment = new _attachment2.default({
      source: req.body.source,
      uploaded: req.body.uploaded,
      orderId: req.body.orderId,
      orderStatus: req.body.orderStatus,
      type: req.body.type,
      extension: req.body.extension
    });
    attachment.save().then(function (savedAttachment) {
      return res.json(savedAttachment);
    }).catch(function (e) {
      return next(e);
    });
  }
}

/**
 * Update existing attachment
 * @property {string} req.body.username - The username of attachment.
 * @property {string} req.body.mobileNumber - The mobileNumber of attachment.
 * @returns {Attachment}
 */
function update(req, res, next) {
  var attachment = req.attachment;
  attachment.source = req.body.source;
  attachment.uploaded = req.body.uploaded;
  attachment.save().then(function (savedAttachment) {
    return res.json(savedAttachment);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get attachment list.
 * @property {number} req.query.skip - Number of attachments to be skipped.
 * @property {number} req.query.limit - Limit number of attachments to be returned.
 * @returns {Attachment[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _attachment2.default.list({ limit: limit, skip: skip }).then(function (attachments) {
    return res.json(attachments);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete attachment.
 * @returns {Attachment}
 */
function remove(req, res, next) {
  var attachment = req.attachment;
  attachment.remove().then(function (deletedAttachment) {
    return res.json(deletedAttachment);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove };
module.exports = exports['default'];
//# sourceMappingURL=attachment.controller.js.map
