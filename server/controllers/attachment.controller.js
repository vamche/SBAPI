import Attachment from '../models/attachment.model';
import cloudinary from 'cloudinary';
import Order from '../models/order.model';
import BPromise from 'bluebird';
import moment from 'moment';

/**
 * Load attachment and append to req.
 */
function load(req, res, next, id) {
  Attachment.get(id)
    .then((attachment) => {
      req.attachment = attachment; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get attachment
 * @returns {Attachment}
 */
function get(req, res) {
  return res.json(req.attachment);
}

/**
 * Create new attachment
 * @property {string} req.body.name - The name of attachment.
 * @property {string} req.body.tags - The tags of attachment.
 * @returns {Attachment}
 */
function create(req, res, next) {
  if(!req.body.uploaded) {
    cloudinary.uploader.upload(req.body.source,
      (result) => {
      const attachment = new Attachment({
        source: result.url,
        uploaded: true,
        order: req.body.order,
        status: req.body.status,
        type: req.body.type,
        extension: req.body.extension
      });
      attachment.save()
        .then(savedAttachment => res.json(savedAttachment))
        .catch(e => next(e));
    })
    .catch(e => next(e));
  }else{
    const attachment = new Attachment({
      source: req.body.source,
      uploaded: req.body.uploaded,
      order: req.body.order,
      status: req.body.status,
      type: req.body.type,
      extension: req.body.extension
    });
    attachment.save()
      .then(savedAttachment => res.json(savedAttachment))
      .catch(e => next(e));
  }
}

/**
 * Update existing attachment
 * @property {string} req.body.username - The username of attachment.
 * @property {string} req.body.mobileNumber - The mobileNumber of attachment.
 * @returns {Attachment}
 */
function update(req, res, next) {
  const attachment = req.attachment;
  attachment.source = req.body.source;
  attachment.uploaded = req.body.uploaded;
  attachment.save()
    .then(savedAttachment => res.json(savedAttachment))
    .catch(e => next(e));
}

/**
 * Get attachment list.
 * @property {number} req.query.skip - Number of attachments to be skipped.
 * @property {number} req.query.limit - Limit number of attachments to be returned.
 * @returns {Attachment[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Attachment.list({ limit, skip })
    .then(attachments => res.json(attachments))
    .catch(e => next(e));
}

/**
 * Delete attachment.
 * @returns {Attachment}
 */
function remove(req, res, next) {
  const attachment = req.attachment;
  attachment.remove()
    .then(deletedAttachment => res.json(deletedAttachment))
    .catch(e => next(e));
}


export default { load, get, create, update, list, remove };
