import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import attachmentCtrl from '../controllers/attachment.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/attachments - Get list of attachments */
  .get(attachmentCtrl.list)

  /** POST /api/attachments - Create new attachment */
  .post(validate(paramValidation.createAttachment), attachmentCtrl.create);

router.route('/:attachmentId')
/** GET /api/attachments/:attachmentId - Get attachment */
  .get(attachmentCtrl.get)

  /** PUT /api/attachments/:attachmentId - Update attachment */
  .put(validate(paramValidation.updateAttachment), attachmentCtrl.update)

  /** DELETE /api/attachments/:attachmentId - Delete attachment */
  .delete(attachmentCtrl.remove);

/** Load attachment when API with attachmentId route parameter is hit */
router.param('attachmentId', attachmentCtrl.load);

export default router;
