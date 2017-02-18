'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _paramValidation = require('../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _attachment = require('../controllers/attachment.controller');

var _attachment2 = _interopRequireDefault(_attachment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/attachments - Get list of attachments */
.get(_attachment2.default.list)

/** POST /api/attachments - Create new attachment */
.post((0, _expressValidation2.default)(_paramValidation2.default.createAttachment), _attachment2.default.create);

router.route('/:attachmentId')
/** GET /api/attachments/:attachmentId - Get attachment */
.get(_attachment2.default.get)

/** PUT /api/attachments/:attachmentId - Update attachment */
.put((0, _expressValidation2.default)(_paramValidation2.default.updateAttachment), _attachment2.default.update)

/** DELETE /api/attachments/:attachmentId - Delete attachment */
.delete(_attachment2.default.remove);

/** Load attachment when API with attachmentId route parameter is hit */
router.param('attachmentId', _attachment2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=attachment.route.js.map
