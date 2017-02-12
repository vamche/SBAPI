'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _target = require('../models/target.model');

var _target2 = _interopRequireDefault(_target);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load target and append to req.
 */
function load(req, res, next, id) {
  _target2.default.get(id).then(function (target) {
    req.target = target; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get target
 * @returns {Target}
 */
function get(req, res) {
  return res.json(req.target);
}

/**
 * Create new target
 * @property {string} req.body.targetname - The targetname of target.
 * @property {string} req.body.mobileNumber - The mobileNumber of target.
 * @returns {Target}
 */
function create(req, res, next) {
  var target = new _target2.default({
    date: req.body.date,
    description: req.body.description,
    target: req.body.target,
    createdBy: req.body.createdBy
  });

  target.save().then(function (savedTarget) {
    return res.json(savedTarget);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing target
 * @property {string} req.body.targetname - The targetname of target.
 * @property {string} req.body.mobileNumber - The mobileNumber of target.
 * @returns {Target}
 */
function update(req, res, next) {
  var target = req.target;
  target.target = req.body.target ? req.body.target : target.target;
  target.actual = req.body.actual ? req.body.actual : target.actual;
  target.description = req.body.description ? req.body.description : target.description;
  target.save().then(function (savedTarget) {
    return res.json(savedTarget);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get target list.
 * @property {number} req.query.skip - Number of targets to be skipped.
 * @property {number} req.query.limit - Limit number of targets to be returned.
 * @returns {Target[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _target2.default.list({ limit: limit, skip: skip }).then(function (targets) {
    return res.json(targets);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Delete target.
 * @returns {Target}
 */
function remove(req, res, next) {
  var target = req.target;
  target.remove().then(function (deletedTarget) {
    return res.json(deletedTarget);
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove };
module.exports = exports['default'];
//# sourceMappingURL=target.controller.js.map
