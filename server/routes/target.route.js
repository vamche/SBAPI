import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import targetCtrl from '../controllers/target.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/targets - Get list of targets */
  .get(targetCtrl.list)

  /** POST /api/targets - Create new target */
  .post(validate(paramValidation.createTarget), targetCtrl.create);

router.route('/:targetId')
/** GET /api/targets/:targetId - Get target */
  .get(targetCtrl.get)

  /** PUT /api/targets/:targetId - Update target */
  .put(targetCtrl.update)

  /** DELETE /api/targets/:targetId - Delete target */
  .delete(validate(paramValidation.updateTarget), targetCtrl.remove);

/** Load target when API with targetId route parameter is hit */
router.param('targetId', targetCtrl.load);

export default router;
