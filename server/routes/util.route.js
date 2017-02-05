import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import utilCtrl from '../controllers/util.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/assign/:orderId')
    .put(utilCtrl.assign);

/** Load order when API with orderId route parameter is hit */
router.param('orderId', utilCtrl.load);

export default router;
