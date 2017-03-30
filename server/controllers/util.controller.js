import Order from '../models/order.model';
import Pilot from '../models/pilot.model';
import orderCtrl from '../controllers/order.controller';
import pilotCtrl from '../controllers/pilot.controller';
import cloudinary from 'cloudinary';
import geolib from 'geolib';
import moment from 'moment';
import { sendNotification, message } from '../notifications/send';
import { io } from '../../config/express';

const maxDistance = 1000; // 1000 KM


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

function assign(order, pilotId = '', franchise = null){
  if(order.team != null && order.team != '' && order.team != "*" && order.team != "ALL" && order.team != null){
    return pilotCtrl.getUnAssignedPilotsByTeam(order.team, false, franchise)
      .where('location').near({
        center: order.from_location,
        maxDistance: maxDistance * 1000
      })
      .then(pilots => {
        if(pilots.length > 0){
          let validPilots = pilots.filter(pilot => pilot._id.toString() != pilotId);
          let pilot = validPilots[0];
          pilot.isActive = true;
          return pilot.save(pilot)
            .then(pilot => {
              order.pilot = pilot._id;
              return order.save(order);
            });
        }else {
          return order;
        }
      });
  }else{
    return order;
  }
}

function unAssign(orderId, pilotId){
  return Order.get(orderId)
    .then(order =>
    {
      order.pilot = null;
      return order.save()
        .then(savedOrder => {
          assign(savedOrder, pilotId);
        });
    });

}

function uploadImgAsync(img) {
  return new Promise(function (resolve, reject) {
    cloudinary.v2.uploader.upload(img,
      function(err, res){
        if(err) {
          reject(err);
        }
        resolve(res);
      });
  });
}

function assignPending(){
  const pilotIDs = [];
  Order.getUnAssigned()
    .then(orders => {
      console.info('Number of pending orders ' + orders.length);
      orders.forEach(order => {
        if(order.team !== null && order.team !== '' && order.team !== "*" && order.team !== "ALL"){
          Pilot.findOne()
            .where('isAvailable', true)
            .where('teams').in([order.team])
            .where('franchise', order.franchise)
            .where('isActive', false)
            .where('location').near({
            center: order.to_location,
            maxDistance: maxDistance * 1000
          })
            .then(pilot => {
              if(pilot && pilot._id){
                console.info('Pilot available and not null ' + pilot._id.toString());
                order.pilot = pilot._id;
                pilot.isActive = true;
                order.status = 'ASSIGNED';
                order.save()
                  .then((updatedOrder) => {
                    message.headers.en = updatedOrder.id;
                    message.data = updatedOrder;
                    message.contents.en = `Order Assigned \n${updatedOrder.title}. 
                                           \nPick at ${updatedOrder.from_address}`;
                    message.filters = [
                      {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString()},
                      {'operator' : 'OR'},
                      {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
                    ];
                    io && io.emit('ORDER_UPDATED', updatedOrder);
                    sendNotification(message);
                    console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
                    pilot.save();
                  });
              }
            })
            .catch(e => console.error(e));
        }else{
          Pilot.find()
            .where('isAvailable', true)
            .where('isActive', false)
            .where('franchise', order.franchise)
            .where('location').near({
              center: order.to_location,
              maxDistance: maxDistance * 1000
            })
            .then(pilots => {
              let pilot = null;
              if (pilots.length) {
                let pilotSelected = false;
                let i = 0;
                while(!pilotSelected) {
                  pilot = pilots[i];
                  if (pilotIDs.indexOf(pilot._id.toString()) < 0) {
                    pilotSelected = true;
                  } else {
                    i++;
                  }
                }
              }
              if(pilot && pilot._id && pilotIDs.indexOf(pilot._id.toString()) < 0){
                pilotIDs.push(pilot._id.toString());
                console.info('Pilot available and not null ' + pilot._id.toString());
                order.pilot = pilot._id;
                pilot.isActive = true;
                order.status = 'ASSIGNED';
                order.save()
                  .then((updatedOrder) => {
                    message.headers.en = updatedOrder.id;
                    message.data = updatedOrder;
                    message.contents.en = ` Order Assigned \n${updatedOrder.title}. 
                    \nPick at ${updatedOrder.from_address}`;
                    message.filters = [
                      {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString()},
                      {'operator' : 'OR'},
                      {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
                    ];
                    io && io.emit('ORDER_UPDATED', updatedOrder);
                    sendNotification(message);
                    console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
                    pilot.save();
                  });
              }
            })
            .catch(e => console.error(e));

        }
      })
    });

}

/**
 * Returns distance in meters
 * @param coordinates
 * @returns {*}
 */
function calculateDistanceBetweenLatLongs(coordinates){
  const latLongs = coordinates.map(coordinate => {
    return { latitude : coordinate[1],
      longitude : coordinate[0]
    };
  });
  return geolib.getPathLength(latLongs);
}

/**
 * Final Cost in INR
 * @param distance
 * @param timeInSeconds
 * @returns {number}
 */
function calculateFinalCost(distance, timeInSeconds) {
  const minDistance = 4000;
  const baseFare = 50;
  let finalCost = 0;
  let perKM = 10;
  let perHour = 10;
  if(distance < minDistance){
    finalCost = baseFare;
  }else{
    finalCost = baseFare + (((distance - minDistance)/1000)*perKM) + ((timeInSeconds/3600)*perHour);
  }
  return finalCost
}

/**
 * Returns duration in seconds
 * @param fromTime
 * @param toTime
 * @returns {number}
 */
function calculateDuration(fromTime, toTime) {
  return (moment(toTime).diff(moment(fromTime)))/1000;
}




export default { assign, unAssign, uploadImgAsync, assignPending,
  calculateDistanceBetweenLatLongs, calculateDuration, calculateFinalCost };
