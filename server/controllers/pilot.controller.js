import BPromise from 'bluebird';
import Pilot from '../models/pilot.model';
import User from '../models/user.model';

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

function getUnAssignedPilots(){
   return Pilot.find()
        .where('isActive', false);
}

/**
 * Create new pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function create(req, res, next) {
  const pilotId = req.body.userId;
  const pilot = new Pilot({
    userId: pilotId,
    teams: req.body.teams,
    location: req.body.location
  });

  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}


function createPilot(req, res, next){

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password,
        mobileNumber : req.body.mobileNumber,
        emailAddress : req.body.emailAddress
    });

    user.save()
        .then(savedUser => {
            const customer = new Pilot({
                userId : savedUser._id.toString(),
                teams : req.body.teams,
                location : req.body.location
            });
            customer.save()
                .then(savedCustomer => {
                    res.json(savedCustomer);
                })
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function updateLocation(req, res, next) {
  const pilot = req.pilot;
  pilot.location = req.body.location;
  pilot.battery = req.body.battery;
  pilot.isAvailable = req.body.isAvailable;
  pilot.status = req.body.status;
  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

function updateTeams(req, res, next) {
  const pilot = req.pilot;
  pilot.teams = req.body.teams;
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
  pilot.battery = req.pilot.battery;

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

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function listOfPilotsWithUserDetails(req, res, next) {
  const { limit = 100, skip = 0 } = req.query;
  let pilotsWithUserIds = [];
  Pilot.list({ limit, skip })
       .then((pilots) => {
         // pilotsWithUserIds = pilots;
         let updatedPilots = [];
         pilotsWithUserIds = pilots.map(
                                      (pilot) => {
                                        let x;
                                        const y = User.get(pilot.userId)
                                            .then((user) => {
                                              x = pilot;
                                              x.userId = JSON.stringify(user);
                                              updatedPilots.push(x);
                                              return x;
                                            });
                                        return y;
                                      });
         BPromise.all(pilotsWithUserIds)
                .then(() => res.json(updatedPilots))
                .catch(e => next(e));
       })
       .catch(e => next(e));
}

export default {
  load, get, create, update, list, remove, listOfPilotsWithUserDetails, updateLocation, updateTeams, getUnAssignedPilots, createPilot };
