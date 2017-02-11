import Order from '../models/order.model';
import Pilot from '../models/pilot.model';
import orderCtrl from '../controllers/order.controller';
import pilotCtrl from '../controllers/pilot.controller';

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

function assign(orderId, pilotId){
    return pilotCtrl.getUnAssignedPilots()
        .then(pilots => {
            if(pilots.length > 0){
                let validPilots = pilots.filter(pilot => pilot._id != pilotId);
                let pilot = validPilots[0];
                pilot.isActive = true;
                return pilot.save(pilot)
                    .then(pilot => {
                        return Order.get(orderId)
                            .then(order => {
                                order.pilot = pilot._id.toString();
                                return order.save(order);
                            });
                    });
            }else {
              return Order.get(orderId);
            }
        });
}

function unAssign(orderId, pilotId){

    return Order.get(orderId)
        .then(order =>
        {
            order.pilot = null;
            return order.save(order);
        });

}


export default { assign, unAssign };