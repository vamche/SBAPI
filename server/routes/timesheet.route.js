import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import timesheetCtrl from '../controllers/timesheet.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/timesheets - Get list of timesheets */
    .get(timesheetCtrl.list)

    /** POST /api/timesheets - Create new timesheet */
    .post(validate(paramValidation.createTimesheet), timesheetCtrl.create);

router.route('/:timesheetId')
/** GET /api/timesheets/:timesheetId - Get timesheet */
    .get(timesheetCtrl.get)

    /** PUT /api/timesheets/:timesheetId - Update timesheet */
    .put(timesheetCtrl.update)

    /** DELETE /api/timesheets/:timesheetId - Delete timesheet */
    .delete(timesheetCtrl.remove);

/** Load timesheet when API with timesheetId route parameter is hit */
router.param('timesheetId', timesheetCtrl.load);

export default router;
