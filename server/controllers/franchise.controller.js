import Franchise from '../models/franchise.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import BPromise from 'bluebird';
import moment from 'moment';

/**
 * Load franchise and append to req.
 */
function load(req, res, next, id) {
  Franchise.get(id)
    .then((franchise) => {
      req.franchise = franchise; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get franchise
 * @returns {Franchise}
 */
function get(req, res) {
  return res.json(req.franchise);
}

/**
 * Create new franchise
 * @property {string} req.body.username - The username of franchise.
 * @property {string} req.body.mobileNumber - The mobileNumber of franchise.
 * @returns {Franchise}
 */
function create(req, res, next) {
  const franchise = new Franchise({
    name : req.body.name,
    teams : req.body.teams,
    location : req.body.location,
    geo_fence : req.body.geo_fence,
    description: req.body.description
  });

  franchise.save()
    .then(savedFranchise => res.json(savedFranchise))
    .catch(e => next(e));
}


/**
 * Update existing franchise
 * @property {string} req.body.username - The username of franchise.
 * @property {string} req.body.mobileNumber - The mobileNumber of franchise.
 * @returns {Franchise}
 */
function update(req, res, next) {
  const franchise = req.franchise;
  franchise.teams = req.body.teams ? req.body.teams : franchise.teams;
  franchise.geo_fence = req.body.geo_fence ? req.body.geo_fence : franchise.geo_fence;
  franchise.name = req.body.name ? req.body.name : franchise.name;
  franchise.description = req.body.description ? req.body.description : franchise.description;
  franchise.location = req.body.location ? req.body.location : franchise.location;

  franchise.save()
    .then(savedFranchise => res.json(savedFranchise))
    .catch(e => next(e));
}

/**
 * Get franchise list.
 * @property {number} req.query.skip - Number of Franchise to be skipped.
 * @property {number} req.query.limit - Limit number of Franchise to be returned.
 * @returns {Franchise[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Franchise.list({ limit, skip })
    .then(franchises => res.json(franchises))
    .catch(e => next(e));
}

/**
 * Delete franchise.
 * @returns {Franchise}
 */
function remove(req, res, next) {
  const franchise = req.franchise;
  franchise.remove()
    .then(deletedFranchise => res.json(deletedFranchise))
    .catch(e => next(e));
}


function getSales(req, res, next){
  const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
  let sales = []; // Array of {_id: String, title: String, sales: String}
  let promises;
  Franchise.find()
    .then(franchises => {
      promises = franchises.map(franchise => {
        let total = 0;
        const p = Order.find()
          .where('team').in(franchise.teams)
          .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
          .then(orders => {
            orders.forEach(order => {
              total = total + order.final_cost;
            });
            sales.push({
              '_id' : franchise._id,
              'name' : franchise.name,
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

function getSalesByFranchise(req, res, next){
  const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
  let sales; // {_id: String, title: String, sales: String}
  Order.find()
    .where('createdBy', req.franchise._id.toString())
    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
    .then(orders => {
      let total = 0;
      orders.forEach(order => {
        total = total + order.final_cost;
      });
      sales = {
        '_id' : req.franchise._id,
        'name' : req.franchise.name,
        'sales' : total,
        'orders' : orders
      };
      res.json(sales);
    })
    .catch(e => next(e));
}

export default {
  load, get, create, update, list, remove, getSales, getSalesByFranchise };
