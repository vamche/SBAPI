import Order from '../models/order.model';
import Pilot from '../models/pilot.model';
import orderCtrl from '../controllers/order.controller';
import pilotCtrl from '../controllers/pilot.controller';
import cloudinary from 'cloudinary';

const maxDistance = 1; // 1 KM


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

function assign(order, pilotId){
    if(order.team != null && order.team != '' && order.team != "*" && order.team != "ALL"){
      return pilotCtrl.getUnAssignedPilotsByTeam(order.team)
        .where('location').near({
          center: order.from_location,
          maxDistance: maxDistance * 1000
        })
        .then(pilots => {
          if(pilots.length > 0){
            let validPilots = pilots.filter(pilot => pilot._id != pilotId);
            let pilot = validPilots[0];
            pilot.isActive = true;
            return pilot.save(pilot)
              .then(pilot => {
                order.pilot = pilot._id.toString();
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
            return order.save(order);
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
      orders.forEach(order => {
        if(order.team != null && order.team != '' && order.team != "*" && order.team != "ALL"){
          Pilot.findOne()
            .where('team', order.team)
            .where('location').near({
                center: order.from_location,
                maxDistance: maxDistance * 1000
            })
            .then(pilot => {
              if(pilot && pilot._id){
                order.pilot = pilot._id.toString();
                order.save();
              }
            })
            .catch(e => console.error(e));
        }else{
          Pilot.findOne()
            .where('location').near({
            center: order.from_location,
            maxDistance: maxDistance * 1000
            })
            .then(pilot => {
              if(pilot && pilot._id){
                order.pilot = pilot._id.toString();
                order.save();
              }
            })
            .catch(e => console.error(e));

        }
      })
    })
}


export default { assign, unAssign, uploadImgAsync, assignPending };
