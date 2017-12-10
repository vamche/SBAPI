import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import customerCtrl from '../controllers/customer.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/list')
/** GET /api/pliots/list - Get list of customers with respective user details*/
    .get(customerCtrl.listOfCustomersWithUserDetails);


router.route('/')
/** GET /api/customers - Get list of customers */
    .get(expressJwt({secret: config.jwtSecret}), customerCtrl.list)

    /** POST /api/customers - Create new customer */
    .post(expressJwt({secret: config.jwtSecret}),  validate(paramValidation.createCustomer), customerCtrl.create);

router.route('/:customerId')
/** GET /api/customers/:customerId - Get customer */
    .get(expressJwt({secret: config.jwtSecret}), customerCtrl.get)

    /** PUT /api/customers/:customerId - Update customer */
    .put(expressJwt({secret: config.jwtSecret}),  validate(paramValidation.updateCustomer), customerCtrl.update)

    /** DELETE /api/customers/:customerId - Delete customer */
    .delete(expressJwt({secret: config.jwtSecret}), customerCtrl.remove);

router.route('/create')

    /** POST /api/customers - Create new customer */
    .post(customerCtrl.createCustomer);

router.route('/updateLocation/:customerId')

    .put(customerCtrl.updateLocation);

router.route('/updateTeams/:customerId')

    .put(customerCtrl.updateTeams);


router.route('/sales')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(customerCtrl.getSales)

router.route('/sales/:customerId')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(customerCtrl.getSalesByCustomer)

router.route('/report')
  .post(customerCtrl.getReportAllCustomers)

router.route('/report/:customerId')
  .post(customerCtrl.getReport)


/** Load customer when API with customerId route parameter is hit */
router.param('customerId', customerCtrl.load);

export default router;
