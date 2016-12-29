import Pilot from '../models/pilot.model';

/**
 * Load pilot and append to req.
 */
function load(req, res, next, id) {
  Pilot.get(id)
    .then((pilot) => {
      req.pilot = pilot; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get pilot
 * @returns {Pilot}
 */
function get(req, res) {
  return res.json(req.pilot);
}

/**
 * Create new pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function create(req, res, next) {
  const pilotId = req.body.userID;
  const pilot = new Pilot({
    userId: pilotId,
    teams: req.body.teams
  });

  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

/**
 * Update existing pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function update(req, res, next) {
  const pilot = req.pilot;
  pilot.latitude = req.body.latitude;
  pilot.longitude = req.body.longitude;
  pilot.isActive = req.body.isActive;
  pilot.isAvailable = req.body.isAvailable;

  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Pilot.list({ limit, skip })
    .then(pilots => res.json(pilots))
    .catch(e => next(e));
}

/**
 * Delete pilot.
 * @returns {Pilot}
 */
function remove(req, res, next) {
  const pilot = req.pilot;
  pilot.remove()
    .then(deletedPilot => res.json(deletedPilot))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
