import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import customerCtrl from '../controllers/customer.controller';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/list')
/** GET /api/pliots/list - Get list of customers with respective user details*/
    .get(customerCtrl.listOfCustomersWithUserDetails);


router.route('/')
/** GET /api/customers - Get list of customers */
    .get(customerCtrl.list)

    /** POST /api/customers - Create new customer */
    .post(validate(paramValidation.createCustomer), customerCtrl.create);

router.route('/:customerId')
/** GET /api/customers/:customerId - Get customer */
    .get(customerCtrl.get)

    /** PUT /api/customers/:customerId - Update customer */
    .put(validate(paramValidation.updateCustomer), customerCtrl.update)

    /** DELETE /api/customers/:customerId - Delete customer */
    .delete(customerCtrl.remove);

router.route('/create')

    /** POST /api/customers - Create new customer */
    .post(customerCtrl.createCustomer);

router.route('/updateLocation/:customerId')

    .put(customerCtrl.updateLocation);

router.route('/updateTeams/:customerId')

    .put(customerCtrl.updateTeams);

/** Load customer when API with customerId route parameter is hit */
router.param('customerId', customerCtrl.load);

export default router;
