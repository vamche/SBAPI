'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _env = require('./config/env');

var _env2 = _interopRequireDefault(_env);

var _express = require('./config/express');

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _util3 = require('./server/controllers/util.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
_mongoose2.default.Promise = Promise;

// connect to mongo db
_mongoose2.default.connect(_env2.default.db, { server: { socketOptions: { keepAlive: 1 } } });
_mongoose2.default.connection.on('error', function () {
  throw new Error('unable to connect to database: ' + _env2.default.db);
});

// print mongoose logs in dev env
if (_env2.default.MONGOOSE_DEBUG) {
  _mongoose2.default.set('debug', function (collectionName, method, query, doc) {
    debug(collectionName + '.' + method, _util2.default.inspect(query, false, 20), doc);
  });
}

_cloudinary2.default.config({
  cloud_name: _env2.default.cloudinary_cloud_name,
  api_key: _env2.default.cloudinary_api_key,
  api_secret: _env2.default.cloudinary_api_secret
});

var assign = _nodeSchedule2.default.scheduleJob('*/30 * * * * *', function () {
  (0, _util3.assignPending)();
});

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  _express.server.listen(process.env.PORT || _env2.default.port, function () {
    debug('server started on port ' + _env2.default.port + ' (' + _env2.default.env + ')');
  });
}

// Set socket.io listeners.
_express.io.on('connection', function (socket) {
  console.log('Client Connected...');
  socket.on('disconnect', function () {
    console.log('Client Disconnected.');
  });
});

exports.default = _express.app;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
