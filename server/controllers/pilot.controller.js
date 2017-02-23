import BPromise from 'bluebird';
import Pilot from '../models/pilot.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import Timesheet from '../models/timesheet.model';
import moment from 'moment';
import Manager from '../models/manager.model';
import Franchise from '../models/franchise.model';

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

function getUnAssignedPilotsByTeam(team, isActive){
  if(team == 'ALL' || team == '*'){
    return Pilot.find()
      .where('isActive', isActive)
  }else {
    return Pilot.find()
      .where('isActive', isActive)
      .where('teams').in([team]);
  }
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
                userId : savedUser._id,
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
  let promises = [];
  Pilot.list({ limit, skip })
       .then((pilots) => {
         // pilotsWithUserIds = pilots;
         let updatedPilots = [];
         promises = pilots.map((pilot) => {
                                        let pilotToBeUpdated;
                                        const p = User.get(pilot.userId)
                                            .then((user) => {
                                              pilotToBeUpdated = pilot;
                                              pilotToBeUpdated.userId = JSON.stringify(user);
                                              updatedPilots.push(pilotToBeUpdated);
                                              return pilotToBeUpdated;
                                            });
                                        return p;
                                      });
         BPromise.all(promises)
                .then(() => res.json(updatedPilots))
                .catch(e => next(e));
       })
       .catch(e => next(e));
}


function getSales(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales = []; // Array of {_id: String, title: String, sales: String}
    let promises;
    Pilot.find()
        .then(pilots => {
            promises = pilots.map(pilot => {
                let total = 0;
                const p = Order.find()
                    .where('pilot', pilot._id.toString())
                    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
                    .then(orders => {
                        orders.forEach(order => {
                            total = total + order.final_cost;
                        });
                        sales.push({
                            '_id' : pilot._id,
                            'name' : pilot.name,
                            'sales' : total
                        });
                    })
                    .catch(e => next(e));
                return p;
            });
            BPromise.all(promises)
                .then(() => res.json(sales))
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function getSalesByPilot(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}
    Order.find()
        .where('pilot', req.pilot._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .then(orders => {
            let total = 0;
            orders.forEach(order => {
                total = total + order.final_cost;
            });
            sales = {
                '_id' : req.pilot._id,
                'name' : req.pilot.name,
                'sales' : total,
                'orders' : orders
            };
            res.json(sales);
        })
        .catch(e => next(e));
}


function getTimesheets(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let times = []; // Array of {_id: String, title: String, sales: String}
    let promises;
    Pilot.find()
        .then(pilots => {
            promises = pilots.map(pilot => {
                let total = 0;
                const p = Timesheet.find()
                    .where('pilot', pilot._id.toString())
                    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
                    .sort({ createdAt: 1 })
                    .then(timesheets => {
                        let diff = 0;
                        let len = 0;
                        timesheets.forEach(timesheet => {
                            len++;
                            if(len === 1) {
                                if(timesheet.isAvailable){
                                    diff -= moment(timesheet.createdAt).unix();
                                }else{
                                    diff -= moment(fromDate, "YYYYMMDD").startOf('day').unix();
                                    diff += moment(timesheet.createdAt).unix();
                                }
                            }else if(len === timesheets.length){
                                if(!timesheet.isAvailable){
                                    diff += moment(timesheet.createdAt).unix();
                                }else{
                                    diff -= moment(timesheet.createdAt).unix();
                                    if(toDate === moment().format('YYYYMMDD')){
                                        diff += moment().unix();
                                    }else{
                                        diff += moment(toDate, "YYYYMMDD").endOf('day').unix();
                                    }
                                }
                            }else {
                                if(timesheet.isAvailable){
                                    diff -= moment(timesheet.createdAt).unix();
                                }else{
                                    diff += moment(timesheet.createdAt).unix();
                                }
                            }
                        });
                        times.push({
                            '_id' : pilot._id,
                            'name' : pilot.name,
                            'time' : diff/(60*60),
                            'timesheets' : timesheets
                        });
                    })
                    .catch(e => next(e));
                return p;
            });
            BPromise.all(promises)
                .then(() => res.json(times))
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function getTimesheetsByPilot(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}
    let times;
    Timesheet.find()
        .where('pilot', req.pilot._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .sort({ createdAt: 1 })
        .then(timesheets => {
            let diff = 0;
            let len = 0;
            timesheets.forEach(timesheet => {
                len++;
                if(len === 1) {
                    if(timesheet.isAvailable){
                        diff -= moment(timesheet.createdAt).unix();
                    }else{
                        diff -= moment(fromDate, "YYYYMMDD").startOf('day').unix();
                        diff += moment(timesheet.createdAt).unix();
                    }
                }else if(len === timesheets.length){
                    if(!timesheet.isAvailable){
                        diff += moment(timesheet.createdAt).unix();
                    }else{
                        diff -= moment(timesheet.createdAt).unix();
                        if(toDate === moment().format('YYYYMMDD')){
                            diff += moment().unix();
                        }else{
                            diff += moment(toDate, "YYYYMMDD").endOf('day').unix();
                        }
                    }
                }else {
                    if(timesheet.isAvailable){
                        diff -= moment(timesheet.createdAt).unix();
                    }else{
                        diff += moment(timesheet.createdAt).unix();
                    }
                }
            });
            times = {
                '_id' : req.pilot._id,
                'name' : req.pilot.name,
                'time' : diff/(60*60),
                'timesheets' : timesheets
            };
            res.json(times);
        })
        .catch(e => next(e));
}

function stats(req, res, next){
    let teams = [];
    const team = req.body.team;
    let getPilots;
    if (team && team != '*' && team != 'ALL' && teams != '') {
      teams = [team];
      getPilots = Pilot.find()
        .where('teams').in(teams);
    }else {
      getPilots = Pilot.find();
    }
      getPilots
      .then(pilots => {
        const stats = {
          available : 0,
          offline : 0,
          total: 0
        };
        pilots.forEach(pilot => {
          if (pilot.isAvailable) {
            stats.available++;
          }else {
            stats.offline++;
          }
          stats.total++;
        });
        res.json(stats);
      })
      .catch(e => next(e))

}

function listByManager(req, res, next) {
  const { limit = 500, skip = 0 } = req.query;
  if(req.body.managerId){
    Manager.get(req.body.managerId)
      .then(manager => {
        if(manager.isAdmin){
          Pilot.list({ limit, skip })
            .then(pilots => res.json(pilots))
            .catch(e => next(e));
        }else if(manager.isFranchiseAdmin) {
          Franchise.get(manager.franchise)
            .then(franchise => {
              Pilot.list({ limit, skip })
                .where('teams').in(franchise.teams)
                .then(pilots => res.json(pilots))
                .catch(e => next(e));
            })
            .catch(e => next(e));
        }else {
          Pilot.list({ limit, skip })
            .where('teams').in(manager.teams)
            .then(pilots => res.json(pilots))
            .catch(e => next(e));
        }
      });
  }else {
    Pilot.list({ limit, skip })
      .then(pilots => res.json(pilots))
      .catch(e => next(e));
  }
}

function listByTeam(req, res, next){
  const team = req.body.team;
  Pilot.find()
    .where('teams').in([team])
    .then(pilots => res.json(pilots))
    .catch(e => next(e));
}

function updateAvailability(req, res, next){
  const pilot = req.pilot;
  pilot.isAvailable = req.body.isAvailable;
  pilot.save()
    .then(savedPilot => {
      const timesheet = new Timesheet({
        isAvailable: req.body.isAvailable,
        pilot: savedPilot._id.toString(),
        location: req.body.location
      });
      timesheet.save()
        .then(timesheet => res.json(timesheet))
        .catch(e => next(e));

    })
    .catch(e => next(e));
}


export default {
  load, get, create, update, list, remove, listOfPilotsWithUserDetails, updateLocation, updateTeams,
    getUnAssignedPilotsByTeam, createPilot, getSales, getSalesByPilot, getTimesheets, getTimesheetsByPilot,
    stats, listByTeam, updateAvailability, listByManager};
