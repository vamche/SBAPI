import Order from '../models/order.model';
import Attachment from '../models/attachment.model';
import { sendNotification, message, sendSMS } from '../notifications/send';
import { assign, unAssign, uploadImgAsync,
  calculateDistanceBetweenLatLongs, calculateDuration,
  calculateFinalCost, calculateDistancePickedToDelivery } from './util.controller';
import BPromise from 'bluebird';
import cloudinary from 'cloudinary';
import Manager from '../models/manager.model';
import Pilot from '../models/pilot.model';
import Customer from '../models/customer.model';
import Franchise from '../models/franchise.model';
import Team from '../models/franchise.model';
import { io } from '../../config/express';
import mongoose from 'mongoose';

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

  if (req.body.createdByUserRole === 'CUSTOMER') {
    Franchise.findFranchiseContainingLocation(req.body.from_location)
      .then(results => {
        if (results.length !== 0) {
          createOrder(req, res, next, results[0]._id);
        }else {
          createOrder(req, res, next);
        }
      })
  }else {
    createOrder(req, res, next)
  }
}


function createOrder(req, res, next, franchise = null) {
  const order = new Order({
    title: req.body.title,
    description: req.body.description,
    from_name: req.body.from_name,
    from_phone: req.body.from_phone,
    from_email: req.body.from_email,
    from_address: req.body.from_address,
    from_location: req.body.from_location,
    from_date_time: req.body.from_date_time,
    from_landmark: req.body.from_landmark,
    to_name: req.body.to_name,
    to_phone: req.body.to_phone,
    to_email: req.body.to_email,
    to_address: req.body.to_address,
    to_location: req.body.to_location,
    to_date_time: req.body.to_date_time,
    to_landmark: req.body.to_landmark,
    paymentType: req.body.paymentType,
    status: req.body.pilot ? 'ASSIGNED' : 'PENDING',
    tags: req.body.tags,
    team: req.body.team,
    createdBy: req.body.createdBy,
    createdByUserRole: req.body.createdByUserRole,
    franchise: franchise ? franchise : req.body.franchise,
    value: req.body.value ? req.body.value : 0,
    pilot: req.body.pilot ? (new mongoose.Types.ObjectId(req.body.pilot)) : null
  });

  order.save()
    .then(savedOrder => {
      if(savedOrder.pilot === null){
        return assign(savedOrder, null, franchise);
      }else{
        return savedOrder;
      }
    })
    .then((savedOrder) => {
      message.headings.en = savedOrder.id + "";
      message.contents.en = `New Order Placed. \nPick at ${order.from_address}`;
      message.data = savedOrder;
      if(savedOrder.pilot){
        message.filters = [
          {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot.toString()},
          {'operator' : 'OR'},
          {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
        ];

        if (savedOrder.franchise) {
          message.filters.push({'operator' : 'OR'});
          message.filters.push({'field': 'tag', 'key': 'manager', 'relation': '=',
            'value': savedOrder.franchise.toString()});
        }

        Pilot.get(savedOrder.pilot)
          .then(p => {

            p.isActive = true;
            p.save()
             .then(savedPilot => {
               sendSMS(`91${savedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${savedPilot.user.firstName} (${savedPilot.user.mobileNumber}) will deliver it in short time.`, 4);

               io && io.emit('ORDER_ADDED', savedOrder);
               sendNotification(message);
               res.json(savedOrder);

             });


          })
          .catch(e => next(e));

      } else {
        message.filters = [
          {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
        ];
        if (savedOrder.franchise) {
          message.filters.push({'operator' : 'OR'});
          message.filters.push({'field': 'tag', 'key': 'manager', 'relation': '=',
            'value': savedOrder.franchise.toString()});
        }

        io && io.emit('ORDER_ADDED', savedOrder);
        sendNotification(message);
        res.json(savedOrder)
      }

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
  const oldPilotId = req.order.pilot;
  order.pilot = req.body.pilot ? (req.body.pilot) : null;
  order.team = req.body.team ? (req.body.team) : null;
  order.status = req.body.pilot ? 'ASSIGNED' : 'PENDING';
  order.save()
    .then(savedOrder => {
      if(savedOrder.pilot) {
        Pilot.get(savedOrder.pilot)
          .then(newpilot => {
            newpilot.isActive = true;
            newpilot.save()
              .then(updatedNewPilot => {
                if(oldPilotId && oldPilotId._id && oldPilotId._id.toString() !== savedOrder.pilot) {
                  Pilot.get(oldPilotId._id.toString())
                    .then(oldPilot => {
                      oldPilot.isActive = false;
                      oldPilot.save()
                        .then(updatedOldPilot => {
                          message.headings.en = savedOrder.id + "";
                          message.contents.en = `New Order Placed. \nPick at ${savedOrder.from_address}`;
                          message.filters = [
                            {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot},
                            {'operator' : 'OR'},
                            {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
                          ];
                          if (savedOrder.franchise) {
                            message.filters.push({'operator' : 'OR'});
                            message.filters.push({'field': 'tag', 'key': 'manager', 'relation': '=',
                              'value': savedOrder.franchise.toString()});
                          }
                          sendSMS(`91${savedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${newpilot.user.firstName} (${newpilot.user.mobileNumber}) will deliver it in short time.`, 4);

                          io && io.emit('ORDER_UPDATED', savedOrder);
                          sendNotification(message);

                          res.json(savedOrder);
                        })
                        .catch(e => next(e));
                    })

                } else {
                  res.json(savedOrder);
                }
              })
              .catch(e => next(e));
          })
          .catch(e => next(e));
      } else {
        res.json(savedOrder);
      }

    })
    .catch(e => next(e));
}


function updateOrder(order){
  return new Promise((resolve, reject) => {
      Order.get(order._id)
        .then(o => {
          let tobeUpdatedOrder = o;
          let statusChanged = false;
          if(o.status !== order.status) {
            statusChanged = true;
          }
          tobeUpdatedOrder.status = order.status;
          tobeUpdatedOrder.timeline = order.timeline;
          tobeUpdatedOrder.pilot_movement = order.pilot_movement;
          tobeUpdatedOrder.pilot_from_date_time = order.pilot_start_date_time;
          tobeUpdatedOrder.pilot_from_date_time = order.pilot_from_date_time;
          tobeUpdatedOrder.pilot_to_date_time = order.pilot_to_date_time;
          tobeUpdatedOrder.pilot_completed_date_time = order.pilot_completed_date_time;
          tobeUpdatedOrder.cash_collected = order.cash_collected ? order.cash_collected : false;

          if(order.status === 'COMPLETED') {
            const distance = calculateDistanceBetweenLatLongs(order.pilot_movement.coordinates);
            const duration = calculateDuration(order.pilot_start_date_time, order.pilot_completed_date_time);
            const pickUpToDeliveryDistance = calculateDistancePickedToDelivery(order.timeline, order.pilot_movement);
            tobeUpdatedOrder.distance_in_meters = +distance.toFixed(2);
            tobeUpdatedOrder.distance_picked_to_delivery_in_meters = +pickUpToDeliveryDistance.toFixed(2);
            tobeUpdatedOrder.time_in_seconds = duration;
            tobeUpdatedOrder.final_cost = +calculateFinalCost(pickUpToDeliveryDistance, duration).toFixed(2);
          }

          let attachmentsTobeUploaded = order.attachments.filter(a => !a.uploaded);
          tobeUpdatedOrder.attachments = order.attachments.filter(a => a.uploaded);
          tobeUpdatedOrder.attachments = tobeUpdatedOrder.attachments.map(a => mongoose.Types.ObjectId(a._id));

          let aPromises = attachmentsTobeUploaded.map(attachment => {
            return uploadImgAsync("data:image/png;base64," + attachment.source)
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
                        return a.save()
                          .then(savedAttachment => {
                            tobeUpdatedOrder.attachments.push(savedAttachment._id);
                          })
                          .catch(e => reject(e));
                      })
                      .catch(e => reject(e));
          });

          BPromise.all(aPromises)
            .then(() => {
              tobeUpdatedOrder.save()
                  .then(updatedOrder => {
                    if (statusChanged) {
                      io && io.emit('ORDER_UPDATED', updatedOrder );
                      message.filters = [{'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}];
                      message.contents.en = `Order Update \n${updatedOrder.title}. \nStatus ${updatedOrder.status}.`;
                      message.contents.en += updatedOrder.paymentType === 'COD' ?
                        (updatedOrder.cash_collected ? 'Pilot collected cash for the COD order.' : 'Pilot did not collect cash for the COD order.') : '';
                      message.headings.en = updatedOrder.id + "";
                      if (updatedOrder.franchise) {
                        message.filters.push({'operator' : 'OR'});
                        message.filters.push({'field': 'tag', 'key': 'manager', 'relation': '=',
                          'value': updatedOrder.franchise.toString()});
                      }

                      if (updatedOrder.status === 'COMPLETED' && updatedOrder.createdByUserRole === 'CUSTOMER') {
                        message.filters.push({'operator' : 'OR'});
                        message.filters.push({'field': 'tag', 'key': 'customer', 'relation': '=',
                          'value': updatedOrder.createdBy});
                      }

                      sendNotification(message);
                    }
                    if(updatedOrder.pilot) {
                      Pilot.get(updatedOrder.pilot._id.toString())
                        .then(pilot => {
                          if (updatedOrder.status === 'COMPLETED') {
                            pilot.isActive = false;
                            pilot.save()
                              .then(() => {
                                resolve(updatedOrder);
                              })
                              .catch(e => reject(e));
                          }else{
                            resolve(updatedOrder);
                          }
                          if(statusChanged && updatedOrder.status === 'STARTED') {
                            //sendSMS(`91${updatedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${pilot.user.firstName} (${pilot.user.mobileNumber}) will deliver it in short time.`, 4);
                          }
                        })
                        .catch(e => reject(e));
                    }
                  })
                  .catch(e => reject(e));
            })
            .catch(e => reject(e));
      })
      .catch(e => reject(e));
  });
}

function updateOrders(req, res, next) {
  let updatedOrders = [];
  const promises = req.body.orders.map(order => {
    return updateOrder(order)
      .then(updatedOrder => {
        updatedOrder.attachments = [];
        updatedOrder.pilot = '';
        updatedOrder.team = '';
        updatedOrders.push(updatedOrder);
      })
      .catch(e => next(e));
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
  const { limit = 100, skip = 0 } = req.query;
  const { pilot, date, timeZone } = req.body;
  Order.listByPilotAndDate({pilot, date, timeZone, limit, skip})
        .then(orders => {
          res.json(orders);
        })
        .catch(e => next(e));
}

function listByDate(req, res, next) {
    const { limit = 500, skip = 0 } = req.query;
    const { date, timeZone } = req.body;
    const franchise = req.body.franchise;

    if (franchise) {
      const customer = req.body.customer;
      Order.listByFranchiseAndDate({date, timeZone, franchise, limit, skip})
        .then(orders => res.json(orders))
        .catch(e => next(e));
    }else if(req.body.manager){
      Manager.get(req.body.manager)
        .then(manager => {
          if(manager.isAdmin){
            Order.listByDate({date, timeZone, limit, skip})
              .then(orders => res.json(orders))
              .catch(e => next(e));
          }else if(manager.isFranchiseAdmin){
            Team.find()
              .where()
              .then(franchise => {
                const teams = manager.teams;
                Order.listByTeamsAndDate({date, timeZone, teams, limit, skip})
                  .where('team').in(franchise.teams)
                  .then(orders => res.json(orders))
                  .catch(e => next(e));
              })
              .catch(e => next(e));
          }else {
            const teams = manager.teams;
            Order.listByTeamsAndDate({date, timeZone, teams, limit, skip})
              .then(orders => res.json(orders))
              .catch(e => next(e));
          }
        });
    }else if(req.body.customer){
      const customer = req.body.customer;
      Order.listByCustomerAndDate({date, timeZone, customer, limit, skip})
        .then(orders => res.json(orders))
        .catch(e => next(e));
     }
    // else {
    //    Order.listByDate({date, timeZone, limit, skip})
    //     .then(orders => res.json(orders))
    //     .catch(e => next(e));
    // }
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
    .then(deletedOrder => {
      const pilot = req.order.pilot;
      if (pilot) {
        Pilot.get(pilot)
          .then(oldPilot => {
            oldPilot.isActive = false;
            oldPilot.save()
              .then(updatedOldPilot => res.json(deletedOrder))
              .catch(e => next(e));
          })
          .catch(e => next(e));

      } else {
        res.json(deletedOrder);
      }

    })
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
  const pilot = order.pilot.toString();
  order.status = 'PENDING';
  order.pilot = null;
  order.save()
    .then(savedOrder => {
      return assign(savedOrder, pilot);
    })
    .then(savedOrder => {
      message.headings.en = savedOrder.id + "";
      message.contents.en = `New Order Assigned. \nPick at ${savedOrder.from_address}`;
      message.data = savedOrder;
      if(savedOrder.pilot){
        message.filters = [
          {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': savedOrder.pilot.toString()},
          {'operator' : 'OR'},
          {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
        ];

        if (savedOrder.franchise) {
          message.filters.push({'operator' : 'OR'});
          message.filters.push({'field': 'tag', 'key': 'manager', 'relation': '=',
            'value': savedOrder.franchise.toString()});
        }

        Pilot.get(savedOrder.pilot)
          .then(p => {

            p.isActive = true;
            p.save()
              .then(savedPilot => {
                sendSMS(`91${savedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${savedPilot.user.firstName} (${savedPilot.user.mobileNumber}) will deliver it in short time.`, 4);

                io && io.emit('ORDER_UPDATED', savedOrder);
                sendNotification(message);
                Pilot.get(pilot)
                  .then(oldPilot => {
                    oldPilot.isActive = false;
                    oldPilot.save()
                      .then(() => res.json(savedOrder));
                  })
                  .catch(e => next(e));
              });
          })
          .catch(e => next(e));
      } else {
        Pilot.get(pilot)
          .then(oldPilot => {
            oldPilot.isActive = false;
            oldPilot.save()
              .then(() => res.json(savedOrder));
          })
          .catch(e => next(e));
      }
    })
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove, reject,
    updateStatus, updatePilotMovement, listByPilotAndDate, listByDate, listByStatusPilotDateRange, updateOrders,
    stats, listByTeam};
