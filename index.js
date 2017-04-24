import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import util from 'util';
import config from './config/env';
import { app, server, io }  from './config/express';
import schedule from 'node-schedule';
import { assignPending, alertPending } from './server/controllers/util.controller';

const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret
});

let assignPendingOrders = schedule.scheduleJob('*/30 * * * * *', () => {
  assignPending();
});

let alertPendingOrders = schedule.scheduleJob('*/10 * * * * *', () => {
  alertPending();
});


// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  server.listen(process.env.PORT || config.port, () => {
    debug(`server started on port ${config.port} (${config.env})`);
  });
}

// Set socket.io listeners.
io.on('connection', (socket) => {
  console.log('Client Connected...');
  socket.on('disconnect', () => {
    console.log('Client Disconnected.');
  });
});

export default app;
