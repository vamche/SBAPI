import Target from '../models/target.model';

/**
 * Load target and append to req.
 */
function load(req, res, next, id) {
  Target.get(id)
    .then((target) => {
      req.target = target; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get target
 * @returns {Target}
 */
function get(req, res) {
  return res.json(req.target);
}

/**
 * Create new target
 * @property {string} req.body.targetname - The targetname of target.
 * @property {string} req.body.mobileNumber - The mobileNumber of target.
 * @returns {Target}
 */
function create(req, res, next) {
  const target = new Target({
    date : req.body.date,
    description : req.body.description,
    target : req.body.target,
    createdBy : req.body.createdBy
  });

  target.save()
    .then(savedTarget => res.json(savedTarget))
    .catch(e => next(e));
}

/**
 * Update existing target
 * @property {string} req.body.targetname - The targetname of target.
 * @property {string} req.body.mobileNumber - The mobileNumber of target.
 * @returns {Target}
 */
function update(req, res, next) {
  const target = req.target;
  target.target = req.body.target ? req.body.target : target.target;
  target.actual = req.body.actual ? req.body.actual : target.actual;
  target.description = req.body.description ? req.body.description : target.description;
  target.save()
    .then(savedTarget => res.json(savedTarget))
    .catch(e => next(e));
}

/**
 * Get target list.
 * @property {number} req.query.skip - Number of targets to be skipped.
 * @property {number} req.query.limit - Limit number of targets to be returned.
 * @returns {Target[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Target.list({ limit, skip })
    .then(targets => res.json(targets))
    .catch(e => next(e));
}

/**
 * Delete target.
 * @returns {Target}
 */
function remove(req, res, next) {
  const target = req.target;
  target.remove()
    .then(deletedTarget => res.json(deletedTarget))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
