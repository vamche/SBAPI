import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import pilotCtrl from '../controllers/pilot.controller';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/list')
  /** GET /api/pliots/list - Get list of pilots with respective user details*/
  .post(pilotCtrl.listByManager);

router.route('/')
  /** GET /api/pilots - Get list of pilots */
  .get(pilotCtrl.list)

  /** POST /api/pilots - Create new pilot */
  .post(validate(paramValidation.createPilot), pilotCtrl.create);

router.route('/:pilotId')
  /** GET /api/pilots/:pilotId - Get pilot */
  .get(pilotCtrl.get)

  /** PUT /api/pilots/:pilotId - Update pilot */
  .put(validate(paramValidation.updatePilot), pilotCtrl.update)

  /** DELETE /api/pilots/:pilotId - Delete pilot */
  .delete(pilotCtrl.remove);

router.route('/create')

    /** POST /api/pilots/create - Create new customer */
    .post(pilotCtrl.createPilot);

router.route('/updateLocation/:pilotId')

  .put(pilotCtrl.updateLocation);

router.route('/updateTeams/:pilotId')

    .put(pilotCtrl.updateTeams);

router.route('/sales')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(pilotCtrl.getSales)

router.route('/sales/:pilotId')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(pilotCtrl.getSalesByPilot)

router.route('/timesheets')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(pilotCtrl.getTimesheets)

router.route('/timesheets/:pilotId')
/** GET /api/customers/sales - Get sales by date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(pilotCtrl.getTimesheetsByPilot)

router.route('/stats')
  .post(pilotCtrl.stats)

router.route('/listByTeam')
  .post(pilotCtrl.listByTeam)

router.route('/updateAvailability/:pilotId')
  .post(pilotCtrl.updateAvailability)

/** Load pilot when API with pilotId route parameter is hit */
router.param('pilotId', pilotCtrl.load);

export default router;
