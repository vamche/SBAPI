import Order from '../models/order.model';
import Pilot from '../models/pilot.model';
import orderCtrl from '../controllers/order.controller';
import pilotCtrl from '../controllers/pilot.controller';
import cloudinary from 'cloudinary';
import geolib from 'geolib';
import moment from 'moment';
import { sendNotification, message, sendSMS, pushNotificationTemplateId } from '../notifications/send';
import { io } from '../../config/express';

const maxDistance = 3; // 3 KM

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
      .where('last_updated_location_time').gte(moment().subtract(10, 'minutes'))
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
              return order.save();
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
            .where('last_updated_location_time').gte(moment().subtract(10, 'minutes'))
            .where('location').near({
            center: order.from_location,
            maxDistance: maxDistance * 1000
          })
            .populate('user')
            .then(pilot => {
              if(pilot && pilot._id){
                console.info('Pilot available and not null ' + pilot._id.toString());
                order.pilot = pilot._id;
                pilot.isActive = true;
                order.status = 'ASSIGNED';
                order.save()
                  .then((updatedOrder) => {
                    //message.template_id = pushNotificationTemplateId;
                    const msg = Object.assign({}, message);
                    msg.headings.en = updatedOrder.id + "";
                    msg.data = updatedOrder;
                    msg.contents.en = `Order Assigned \n${updatedOrder.title}. 
                                           \nPick at ${updatedOrder.from_address}`;
                    msg.filters = [
                      {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString()},
                      {'operator' : 'OR'},
                      {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
                    ];
                    io && io.emit('ORDER_UPDATED', updatedOrder);
                    sendNotification(msg);
                    console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
                    sendSMS(`91${updatedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${pilot.user.firstName} (${pilot.user.mobileNumber}) will deliver it in short time.`, 4);
                    pilot.save();
                  });
              }
            })
            .catch(e => console.error(e));
        }else{
          Pilot.findOne()
            .where('isAvailable', true)
            .where('isActive', false)
            .where('franchise', order.franchise)
            .where('last_updated_location_time').gte(moment().subtract(10, 'minutes'))
            .where('location').near({
              center: order.from_location,
              maxDistance: maxDistance * 1000
            })
            .populate('user')
            .then(pilot => {
              if(pilot && pilot._id && !pilot.isActive){
                console.info('Pilot available and not null ' + pilot._id.toString());
                order.pilot = pilot._id;
                pilot.isActive = true;
                order.status = 'ASSIGNED';
                order.save()
                  .then((updatedOrder) => {
                    //message.template_id = pushNotificationTemplateId;
                    const msg = Object.assign({}, message);
                    msg.headings.en = updatedOrder.id + "";
                    msg.data = updatedOrder;
                    msg.contents.en = ` Order Assigned \n${updatedOrder.title}. 
                    \nPick at ${updatedOrder.from_address}`;
                    msg.filters = [
                      {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': updatedOrder.pilot.toString()},
                      {'operator' : 'OR'},
                      {'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}
                    ];
                    io && io.emit('ORDER_UPDATED', updatedOrder);
                    sendNotification(msg);
                    console.info("Order Assigned :: " + updatedOrder.title + " :: " + updatedOrder.pilot.toString());
                    sendSMS(`91${updatedOrder.to_phone}`, `Hurray! Your delivery is on its way. Our member ${pilot.user.firstName} (${pilot.user.mobileNumber}) will deliver it in short time.`, 4);
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
  console.log('d ' + geolib.getPathLength(latLongs));
  return geolib.getPathLength(latLongs);
}


/**
 * Returns distance in meters
 * @param coordinates
 * @returns {*}
 */
function calculateDistancePickedToDelivery(timeline, orderPilotMovement){

  for(i=0; i < timeline.length; i++ ){
    const status = timeline[i];
    if(status.indexOf('PICKED') > -1) {
      const lonLats = status[2].split(',');
      const pilot_movement = orderPilotMovement.coordinates;
      if(pilot_movement.length > 0){
        let hash = {};
        for(var i = 0 ; i < pilot_movement.length; i += 1) {
          hash[pilot_movement[i]] = i;
        }
        console.log('out' + lonLats);
        if(hash.hasOwnProperty(lonLats)) {
          console.log('in' + lonLats);
          const d = calculateDistanceBetweenLatLongs(pilot_movement.slice(hash[lonLats], pilot_movement.length));
          return d;
        } else {
          return calculateDistanceBetweenLatLongs(pilot_movement);
        }
      }else {
        return 0;
      }
    }
  }


}



/**
 * Final Cost in INR
 * @param distance
 * @param timeInSeconds
 * @returns {number}
 */
function calculateFinalCost(distance, timeInSeconds) {
  const minDistance = 4500;
  const baseFare = 45;
  let finalCost = 0;
  let perKM = 10;
  let perHour = 10;
  let tax = 15;
  if(distance < minDistance){
    finalCost = baseFare;
    finalCost += (finalCost * (tax/100));
  }else{
    finalCost = baseFare + (((distance - minDistance)/1000)*perKM); //+ ((timeInSeconds/3600)*perHour);
    finalCost += (finalCost * (tax/100));
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


function alertPending() {

  Order.find()
    .where('status').ne('COMPLETED')
    // .populate({
    //   path: 'pilot',
    //   populate: { path: 'user' }})
    .sort({ createdAt: -1 })
    .then(orders  => {
        if (orders.length > 0) {
          sendPendingOrderAlert(orders, 0);
        }
    })
    .catch(e => console.log(e));

}

function sendPendingOrderAlert(orders, i) {

  if (i >= orders.length) {
    return;
  }

  const order = orders[i];

  if (order.pilot) {
    const msg = Object.assign({}, message);
    const diffInMinutes = moment().tz('Asia/Kolkata').utcOffset();
    const orderCreatedDate = moment(order.createdAt).subtract(diffInMinutes).format('DD-MM-YYYY');
    const currentDate = moment().subtract(diffInMinutes).format('DD-MM-YYYY');
    if (orderCreatedDate !== currentDate) {
      delete msg.template_id;
      msg.headings.en = order.id + "";
      msg.data = order;
      msg.contents.en = `Order number ${order.id} dated ${orderCreatedDate} is not completed yet. Please complete it.`;
      msg.filters = [
        {'field': 'tag', 'key': 'pilot', 'relation': '=', 'value': order.pilot.toString()}
      ];
      delete msg.template_id;
      sendNotification(msg)
        .then(() => {
          sendPendingOrderAlert(orders, i+1);
        });
    } else {
      sendPendingOrderAlert(orders, i+1);
    }
  } else {
    sendPendingOrderAlert(orders, i+1);
  }
}

function clearReports() {

}

export default { assign, unAssign, uploadImgAsync, assignPending, alertPending,
  calculateDistanceBetweenLatLongs, calculateDuration, calculateFinalCost,
  calculateDistancePickedToDelivery };
