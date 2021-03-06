import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import franchiseCtrl from '../controllers/franchise.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/franchises - Get list of franchises */
  .get(franchiseCtrl.list)

  /** POST /api/franchises - Create new franchise */
  .post(validate(paramValidation.createFranchise), franchiseCtrl.create);

router.route('/:franchiseId')
/** GET /api/franchises/:franchiseId - Get franchise */
  .get(franchiseCtrl.get)

  /** PUT /api/franchises/:franchiseId - Update franchise */
  .put(validate(paramValidation.updateFranchise), franchiseCtrl.update)

  /** DELETE /api/franchises/:franchiseId - Delete franchise */
  .delete(franchiseCtrl.remove);

router.route('/sales')
/** GET /api/franchises/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
  .post(franchiseCtrl.getSales)

router.route('/sales/:franchiseId')
/** GET /api/franchises/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
  .post(franchiseCtrl.getSalesByFranchise)

router.route('/findFranchiseContainingLocation')
  .post(franchiseCtrl.findFranchiseContainingLocation)

/** Load franchise when API with franchiseId route parameter is hit */
router.param('franchiseId', franchiseCtrl.load);

export default router;
