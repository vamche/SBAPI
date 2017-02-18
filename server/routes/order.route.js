import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import orderCtrl from '../controllers/order.controller';
import expressJwt from 'express-jwt';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/orders - Get list of orders */
  .get(orderCtrl.list)

  /** POST /api/orders - Create new order */
  .post(validate(paramValidation.createOrder), orderCtrl.create);

router.route('/:orderId')
  /** GET /api/orders/:orderId - Get order */
  .get(orderCtrl.get)

  /** PUT /api/orders/:orderId - Update order */
  .put(validate(paramValidation.updateOrder), orderCtrl.update)

  /** DELETE /api/orders/:orderId - Delete order */
  .delete(orderCtrl.remove);

router.route('/listByPilot')
    .post(orderCtrl.listByPilotAndDate)

router.route('/listByDate')
    .post(expressJwt({ secret: config.jwtSecret }), orderCtrl.listByDate)

router.route('/listByTeam')
    .post(orderCtrl.listByTeam)

router.route('/updateStatus/:orderId')
  .put(orderCtrl.updateStatus);

router.route('/updatePilotMovement/:orderId')
  .put(orderCtrl.updatePilotMovement);

router.route('/update/bulk')
  .put(orderCtrl.updateOrders);

router.route('/stats')
  .post(orderCtrl.stats)

router.route('/reject/:orderId')
  .post(orderCtrl.reject)

/** Load order when API with orderId route parameter is hit */
router.param('orderId', orderCtrl.load);

export default router;
