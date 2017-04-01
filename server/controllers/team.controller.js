import Team from '../models/team.model';
import Order from '../models/order.model';
import BPromise from 'bluebird';
import moment from 'moment';

/**
 * Load team and append to req.
 */
function load(req, res, next, id) {
  Team.get(id)
    .then((team) => {
      req.team = team; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get team
 * @returns {Team}
 */
function get(req, res) {
  return res.json(req.team);
}

/**
 * Create new team
 * @property {string} req.body.name - The name of team.
 * @property {string} req.body.tags - The tags of team.
 * @returns {Team}
 */
function create(req, res, next) {
  const team = new Team({
    name: req.body.name,
    tags: req.body.tags,
    franchise : req.body.franchise ? req.body.franchise : null
  });

  team.save()
    .then(savedTeam => res.json(savedTeam))
    .catch(e => next(e));
}

/**
 * Update existing team
 * @property {string} req.body.username - The username of team.
 * @property {string} req.body.mobileNumber - The mobileNumber of team.
 * @returns {Team}
 */
function update(req, res, next) {
  const team = req.team;
  team.name = req.body.name;
  team.tags = req.body.tags;

  team.save()
    .then(savedTeam => res.json(savedTeam))
    .catch(e => next(e));
}

/**
 * Get team list.
 * @property {number} req.query.skip - Number of teams to be skipped.
 * @property {number} req.query.limit - Limit number of teams to be returned.
 * @returns {Team[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  const franchise = req.body.franchise;
  Team.list({ limit, skip, franchise })
    .then(teams => res.json(teams))
    .catch(e => next(e));
}

function listByFranchise(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  const franchise = req.body.franchise;
  Team.list({ limit, skip, franchise })
    .then(teams => res.json(teams))
    .catch(e => next(e));
}

/**
 * Delete team.
 * @returns {Team}
 */
function remove(req, res, next) {
  const team = req.team;
  team.remove()
    .then(deletedTeam => res.json(deletedTeam))
    .catch(e => next(e));
}


function getSales(req, res, next){
  const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
  let sales = []; // Array of {_id: String, title: String, sales: String}
  let promises;
  const franchise = req.body.franchise;
  Team.find()
    .where('franchise', franchise)
    .then(teams => {
              promises = teams.map(team => {
                  let total = 0;
                  let numberOfOrders = 0;
                  const p = Order.find()
                      .where('team', team._id.toString())
                      .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
                      .then(orders => {
                          orders.forEach(order => {
                            total += order.final_cost;
                            numberOfOrders++;
                          });
                          sales.push({
                              '_id' : team._id,
                              'name' : team.name,
                              'sales' : total,
                              'orders' : numberOfOrders
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

function getSalesByTeam(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}

      Order.find()
        .where('team', req.team._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .then(orders => {
          let total = 0;
          orders.forEach(order => {
            total = total + order.final_cost;
          });
          sales = {
            '_id' : req.team._id,
            'name' : req.team.name,
            'sales' : total
          };
          res.json(sales);
        })
        .catch(e => next(e));


}

export default { load, get, create, update, list, remove, getSales, getSalesByTeam, listByFranchise };
