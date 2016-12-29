import Order from '../models/order.model';

/**
 * Load order and append to req.
 */
function load(req, res, next, id) {
  Order.get(id)
    .then((order) => {
      req.order = order; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get order
 * @returns {Order}
 */
function get(req, res) {
  return res.json(req.order);
}

/**
 * Create new order
 * @property {string} req.body.username - The username of order.
 * @property {string} req.body.mobileNumber - The mobileNumber of order.
 * @returns {Order}
 */
function create(req, res, next) {
  const order = new Order({
    title: req.body.title,
    description: req.body.description,
    from_name: req.body.from_name,
    from_phone: req.body.from_phone,
    from_email: req.body.from_email,
    from_address: req.body.from_address,
    from_latitiude: req.body.from_latitiude,
    from_longitude: req.body.from_longitude,
    from_date_time: req.body.from_date_time,
    to_name: req.body.to_name,
    to_phone: req.body.to_phone,
    to_email: req.body.to_email,
    to_address: req.body.to_address,
    to_latitiude: req.body.to_latitiude,
    to_longitude: req.body.to_longitude,
    to_date_time: req.body.to_date_time,
    paymentType: req.body.paymentType,
    status: req.body.status,
    tags: req.body.tags
  });

  order.save()
    .then(savedOrder => res.json(savedOrder))
    .catch(e => next(e));
}

/**
 * Update existing order
 * @property {string} req.body.username - The username of order.
 * @property {string} req.body.mobileNumber - The mobileNumber of order.
 * @returns {Order}
 */
function update(req, res, next) {
  const order = req.order;
  order.pilot = order.pilot;
  order.status = req.body.status;
  order.save()
    .then(savedOrder => res.json(savedOrder))
    .catch(e => next(e));
}

/**
 * Get order list.
 * @property {number} req.query.skip - Number of orders to be skipped.
 * @property {number} req.query.limit - Limit number of orders to be returned.
 * @returns {Order[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Order.list({ limit, skip })
    .then(orders => res.json(orders))
    .catch(e => next(e));
}

/**
 * Delete order.
 * @returns {Order}
 */
function remove(req, res, next) {
  const order = req.order;
  order.remove()
    .then(deletedOrder => res.json(deletedOrder))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
