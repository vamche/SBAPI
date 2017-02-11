import BPromise from 'bluebird';
import Customer from '../models/customer.model';
import User from '../models/user.model';

/**
 * Load customer and append to req.
 */
function load(req, res, next, id) {
  Customer.get(id)
    .then((customer) => {
      req.customer = customer; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get customer
 * @returns {Customer}
 */
function get(req, res) {
  return res.json(req.customer);
}

/**
 * Create new customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function create(req, res, next) {
  const customer = new Customer({
    userId : req.body.userId,
    teams : req.body.teams,
    location : req.body.location
  });

  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

function createCustomer(req, res, next){

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
            const customer = new Customer({
                userId : savedUser._id.toString(),
                isMerchant : req.body.isMerchant,
                teams : req.body.teams,
                location : req.body.location
            });
            customer.save()
                .then(savedCustomer => {
                    res.json(savedCustomer);
                })
                .catch(e => next(e));
        })
        .catch(e => next(e));
}


function updateLocation(req, res, next) {
  const customer = req.customer;
  customer.location = req.body.location;
  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

function updateTeams(req, res, next) {
  const customer = req.customer;
  customer.teams = req.body.teams;
  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

/**
 * Update existing customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function update(req, res, next) {
  const customer = req.customer;
  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Customer.list({ limit, skip })
    .then(customers => res.json(customers))
    .catch(e => next(e));
}

/**
 * Delete customer.
 * @returns {Customer}
 */
function remove(req, res, next) {
  const customer = req.customer;
  customer.remove()
    .then(deletedCustomer => res.json(deletedCustomer))
    .catch(e => next(e));
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function listOfCustomersWithUserDetails(req, res, next) {
  const { limit = 100, skip = 0 } = req.query;
  let customersWithUserIds = [];
  Customer.list({ limit, skip })
    .then((customers) => {
      // customersWithUserIds = customers;
      let updatedCustomers = [];
      customersWithUserIds = customers.map(
        (customer) => {
          let x;
          const y = User.get(customer.userId)
            .then((user) => {
              x = customer;
              x.userId = JSON.stringify(user);
              updatedCustomers.push(x);
              return x;
            });
          return y;
        });
      BPromise.all(customersWithUserIds)
        .then(() => res.json(updatedCustomers))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

export default {
  load, get, create, update, list, remove, listOfCustomersWithUserDetails, updateLocation, updateTeams, createCustomer };
