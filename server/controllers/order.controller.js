import Order from '../models/order.model';
import Attachment from '../models/attachment.model';
import { sendNotification, message } from '../notifications/send';
import { assign, unAssign, uploadImgAsync } from './util.controller';
import BPromise from 'bluebird';
import cloudinary from 'cloudinary';

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
    from_location: req.body.from_location,
    from_date_time: req.body.from_date_time,
    to_name: req.body.to_name,
    to_phone: req.body.to_phone,
    to_email: req.body.to_email,
    to_address: req.body.to_address,
    to_location: req.body.to_location,
    to_date_time: req.body.to_date_time,
    paymentType: req.body.paymentType,
    status: req.body.status,
    tags: req.body.tags,
    team: req.body.team,
    pilot: req.body.pilot ?  req.body.pilot : ''
  });

  order.save()
    .then(savedOrder => {
      if(savedOrder.pilot == ''){
        return assign(savedOrder, savedOrder.team);
      }else{
        return savedOrder;
      }
    })
    .then((savedOrder) => {
      message.contents.en = `New Order Placed \n${order.title}. \nPick at ${order.from_address}.
                              `;
      sendNotification(message);
      res.json(savedOrder)
    })
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
  order.pilot_movement = req.body.pilot_movement;
  order.save()
    .then(savedOrder => res.json(savedOrder))
    .catch(e => next(e));
}

function updateOrders(req, res, next){
  let updatedOrders = [];
  const promises = req.body.orders.map(
    order => {
      let tobeUpdatedOrder;
      return Order.get(order._id)
        .then(o => {
          tobeUpdatedOrder = o;
          let attachmentsTobeUploaded = order.attachments.filter(a => !a.uploaded);
          tobeUpdatedOrder.attachments = order.attachments.filter(a => a.uploaded);
          let i = 0;
          let aPromises = attachmentsTobeUploaded.map(attachment => {
            uploadImgAsync("data:image/png;base64," + attachment.source)
              .then(result => {
                let a = new Attachment({
                  source: result.url,
                  uploaded: true,
                  orderId: attachment.orderId,
                  orderStatus: attachment.orderStatus,
                  type: attachment.type,
                  extension: attachment.extension
                });
                return a;
              })
              .then(a => {
                i ++;
                return a.save()
                  .then(savedAttachment => {
                    tobeUpdatedOrder.attachments.push(savedAttachment._id);
                    if(i == attachmentsTobeUploaded.length){
                      return tobeUpdatedOrder.save()
                                .then(updatedOrder => {
                                  updatedOrders.push(updatedOrder);
                                })
                                .catch(e => next(e));
                    }
                  })
                  .catch(e => next(e));
              })
              .catch(e => next(e));
          });
        })
    });
    BPromise.all(promises)
      .then(() => res.json(updatedOrders))
      .catch(e => next(e));
}


function updateStatus(req, res, next) {
  const order = req.order;
  let timeline = order.timeline;
  order.status = req.body.status;
  timeline.push([req.body.status, Date.now(), order.pilot]);
  order.timeline = timeline;
  order.save()
    .then(savedOrder => res.json(savedOrder))
    .then(() => {
      message.contents.en = `Order has been updated. It has been \n${order.status}.                              `;
      sendNotification(message);
    })
    .catch(e => next(e));
}

function updatePilotMovement(req, res, next) {
  const order = req.order;
  order.pilot_movement = req.body.pilot_movement;
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


function listByPilotAndDate(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  const { pilot, date, timeZone } = req.body;
  Order.listByPilotAndDate({pilot, date, timeZone, limit, skip})
        .then(orders => res.json(orders))
        .catch(e => next(e));
}

function listByDate(req, res, next) {
    const { limit = 50, skip = 0 } = req.query;
    const { date } = req.body;
    Order.listByDate({date, limit, skip})
        .then(orders => res.json(orders))
        .catch(e => next(e));
}

function listByStatusPilotDateRange(req, res, next){
  const { status, pilot, fromDate, toDate} = req.body;
  Order.listByPilotDateRangeStatus({pilot, fromDate, toDate, status})
      .then(orders => res.json(orders))
      .catch(e => next(e));
}

function listByTeam(req, res, next){
  const team = req.body.team;
  const date = req.body.date;
  Order.listByTeamAndDate({ team, date })
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


function stats(req, res, next){
  const date = req.body.date;
  Order.listByDate({date})
    .then(orders => {
      const stats = {
        assigned : 0,
        unAssigned : 0,
        completed: 0,
        total: 0
      };
      orders.forEach(order => {
        if (order.status == "COMPLETED") {
          stats.completed++;
        }else if(order.pilot && order.pilot != ''){
          stats.assigned++;
        }else {
          stats.unAssigned++;
        }
        stats.total++;
      });
      res.json(stats);
    })
    .catch(e => next(e))
}

function reject(req, res, next){
  const order = req.order;
  const pilotId = req.body.pilotId;
  order.status = 'PENDING';
  order.pilot = '';
  order.save(savedOrder => {
      assign(savedOrder, pilotId);
    })
    .then(order => res.json(order))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove, reject,
    updateStatus, updatePilotMovement, listByPilotAndDate, listByDate, listByStatusPilotDateRange, updateOrders,
    stats, listByTeam};
