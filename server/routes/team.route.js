import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import teamCtrl from '../controllers/team.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/teams - Get list of teams */
  .get(teamCtrl.list)

  /** POST /api/teams - Create new team */
  .post(validate(paramValidation.createTeam), teamCtrl.create);

router.route('/:teamId')
  /** GET /api/teams/:teamId - Get team */
  .get(teamCtrl.get)

  /** PUT /api/teams/:teamId - Update team */
  .put(validate(paramValidation.updateTeam), teamCtrl.update)

  /** DELETE /api/teams/:teamId - Delete team */
  .delete(teamCtrl.remove);

router.route('/sales')
    /** GET /api/teams/sales - Get sales by team and date range
     * Params
     * { fromDate, toDate }
     * **/
    .post(teamCtrl.getSales)

router.route('/sales/:teamId')
/** GET /api/teams/sales - Get sales by team and date range
 * Params
 * { fromDate, toDate }
 * **/
    .post(teamCtrl.getSalesByTeam)

/** Load team when API with teamId route parameter is hit */
router.param('teamId', teamCtrl.load);

export default router;
