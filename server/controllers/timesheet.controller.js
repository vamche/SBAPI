import Timesheet from '../models/timesheet.model';

/**
 * Load timesheet and append to req.
 */
function load(req, res, next, id) {
    Timesheet.get(id)
        .then((timesheet) => {
            req.timesheet = timesheet; // eslint-disable-line no-param-reassign
            return next();
        })
        .catch(e => next(e));
}

/**
 * Get timesheet
 * @returns {Timesheet}
 */
function get(req, res) {
    return res.json(req.timesheet);
}

/**
 * Create new timesheet
 * @property {string} req.body.timesheetname - The timesheetname of timesheet.
 * @property {string} req.body.mobileNumber - The mobileNumber of timesheet.
 * @returns {Timesheet}
 */
function create(req, res, next) {
    const timesheet = new Timesheet({
        isAvailable: req.body.isAvailable,
        location: req.body.location,
        pilot: req.body.pilot

    });

    timesheet.save()
        .then(savedTimesheet => res.json(savedTimesheet))
        .catch(e => next(e));
}

/**
 * Update existing timesheet
 * @property {string} req.body.timesheetname - The timesheetname of timesheet.
 * @property {string} req.body.mobileNumber - The mobileNumber of timesheet.
 * @returns {Timesheet}
 */
function update(req, res, next) {
    const timesheet = req.timesheet;
    timesheet.isAvailable = req.body.isAvailable ? req.body.isAvailable : timesheet.isAvailable;
    timesheet.location = req.body.location ? req.body.location : timesheet.location;
    timesheet.pilot = req.body.pilot ? req.body.pilot : timesheet.pilot;
    timesheet.save()
        .then(savedTimesheet => res.json(savedTimesheet))
        .catch(e => next(e));
}

/**
 * Get timesheet list.
 * @property {number} req.query.skip - Number of timesheets to be skipped.
 * @property {number} req.query.limit - Limit number of timesheets to be returned.
 * @returns {Timesheet[]}
 */
function list(req, res, next) {
    const { limit = 1000, skip = 0 } = req.query;
    Timesheet.list({ limit, skip })
        .then(timesheets => res.json(timesheets))
        .catch(e => next(e));
}

/**
 * Delete timesheet.
 * @returns {Timesheet}
 */
function remove(req, res, next) {
    const timesheet = req.timesheet;
    timesheet.remove()
        .then(deletedTimesheet => res.json(deletedTimesheet))
        .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
