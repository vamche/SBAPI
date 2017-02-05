import Order from '../models/order.model';
import Order from '../models/pilot.model';
import orderCtrl from '../controllers/order.controller';
import pilotCtrl from '../controllers/pilot.controller';

function assign(orderId, pilotId){
    pilotCtrl.getUnAssignedPilots()
        .then(pilots => {
            let validPilots = pilots.filter(pilot => pilot._id != pilotId);
            let pilot = pilots[0];
            pilot.isActive = true;
            Pilot.save()
                .then(pilot => {
                   Order.get(orderId)
                       .then(order => {
                           order.pilot = pilot._id.toString();
                           Order.save(order)
                              .then(order => console.log(order));
                       });
                });
        })

}


export default { assign };
