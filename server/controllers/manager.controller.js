import Manager from '../models/manager.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import BPromise from 'bluebird';
import moment from 'moment';

/**
 * Load manager and append to req.
 */
function load(req, res, next, id) {
  Manager.get(id)
    .then((manager) => {
      req.manager = manager; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get manager
 * @returns {Manager}
 */
function get(req, res) {
  return res.json(req.manager);
}

/**
 * Create new manager
 * @property {string} req.body.username - The username of manager.
 * @property {string} req.body.mobileNumber - The mobileNumber of manager.
 * @returns {Manager}
 */
function create(req, res, next) {
  const manager = new Manager({
    user : req.body.user,
    teams : req.body.teams,
    location : req.body.location
  });

  manager.save()
    .then(savedManager => res.json(savedManager))
    .catch(e => next(e));
}

function createManager(req, res, next){

  const user = new User({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    username : req.body.username,
    password : req.body.password,
    mobileNumber : req.body.mobileNumber,
    emailAddress : req.body.emailAddress
  });

  user.save()
    .then(savedUser => {
      const manager = new Manager({
        user : savedUser._id,
        isAdmin : req.body.isAdmin,
        teams : req.body.teams,
        location : req.body.location,
        geoFence : req.body.geoFence
      });
      manager.save()
        .then(savedManager => {
          res.json(savedManager);
        })
        .catch(e => next(e));
    })
    .catch(e => next(e));
}


function updateLocation(req, res, next) {
  const manager = req.manager;
  manager.location = req.body.location;
  manager.save()
    .then(savedManager => res.json(savedManager))
    .catch(e => next(e));
}

function updateTeams(req, res, next) {
  const manager = req.manager;
  manager.teams = req.body.teams;
  manager.save()
    .then(savedManager => res.json(savedManager))
    .catch(e => next(e));
}

/**
 * Update existing manager
 * @property {string} req.body.username - The username of manager.
 * @property {string} req.body.mobileNumber - The mobileNumber of manager.
 * @returns {Manager}
 */
function update(req, res, next) {
  const manager = req.manager;
  manager.save()
    .then(savedManager => res.json(savedManager))
    .catch(e => next(e));
}

/**
 * Get manager list.
 * @property {number} req.query.skip - Number of Manager to be skipped.
 * @property {number} req.query.limit - Limit number of Manager to be returned.
 * @returns {Manager[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Manager.list({ limit, skip })
    .then(managers => res.json(managers))
    .catch(e => next(e));
}

/**
 * Delete manager.
 * @returns {Manager}
 */
function remove(req, res, next) {
  const manager = req.manager;
  manager.remove()
    .then(deletedManager => res.json(deletedManager))
    .catch(e => next(e));
}

/**
 * Get manager list.
 * @property {number} req.query.skip - Number of Manager to be skipped.
 * @property {number} req.query.limit - Limit number of Manager to be returned.
 * @returns {Manager[]}
 */
function listOfManagersWithUserDetails(req, res, next) {
  const { limit = 100, skip = 0 } = req.query;
  let managersWithUserIds = [];
  Manager.list({ limit, skip })
    .then((managers) => {
      // managersWithUserIds = managers;
      let updatedManagers = [];
      managersWithUserIds = managers.map(
        (manager) => {
          let x;
          const y = User.get(manager.user)
            .then((user) => {
              x = manager;
              x.user = JSON.stringify(user);
              updatedManagers.push(x);
              return x;
            });
          return y;
        });
      BPromise.all(managersWithUserIds)
        .then(() => res.json(updatedManagers))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}


function getSales(req, res, next){
  const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
  let sales = []; // Array of {_id: String, title: String, sales: String}
  let promises;
  Manager.find()
    .then(managers => {
      promises = managers.map(manager => {
        let total = 0;
        const p = Order.find()
          .where('createdBy', manager._id.toString())
          .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
          .then(orders => {
            orders.forEach(order => {
              total = total + order.final_cost;
            });
            sales.push({
              '_id' : manager._id,
              'name' : manager.name,
              'sales' : total
            });
          })
          .catch(e => next(e));
        return p;
      });
      BPromise.all(promises)
        .then(() => res.json(sales))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

function getSalesByManager(req, res, next){
  const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
  let sales; // {_id: String, title: String, sales: String}
  Order.find()
    .where('createdBy', req.manager._id.toString())
    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
    .then(orders => {
      let total = 0;
      orders.forEach(order => {
        total = total + order.final_cost;
      });
      sales = {
        '_id' : req.manager._id,
        'name' : req.manager.name,
        'sales' : total,
        'orders' : orders
      };
      res.json(sales);
    })
    .catch(e => next(e));
}

export default {
  load, get, create, update, list, remove, listOfManagersWithUserDetails,
  updateLocation, updateTeams, createManager, getSales, getSalesByManager };
