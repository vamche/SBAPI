import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import managerCtrl from '../controllers/manager.controller';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/')
/** GET /api/managers - Get list of managers */
  .get(managerCtrl.list)

  /** POST /api/managers - Create new manager */
  .post(validate(paramValidation.createManager), managerCtrl.create);

router.route('/:managerId')
/** GET /api/managers/:managerId - Get manager */
  .get(managerCtrl.get)

  /** PUT /api/managers/:managerId - Update manager */
  .put(validate(paramValidation.updateManager), managerCtrl.update)

  /** DELETE /api/managers/:managerId - Delete manager */
  .delete(managerCtrl.remove);



router.route('/sales')
/** GET /api/managers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
  .post(managerCtrl.getSales)

router.route('/sales/:managerId')
/** GET /api/managers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
  .post(managerCtrl.getSalesByManager)

/** Load manager when API with managerId route parameter is hit */
router.param('managerId', managerCtrl.load);

export default router;
