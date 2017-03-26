import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Attachment Schema
 */
const AttachmentSchema = new mongoose.Schema({
  source:{
    type: String,
    required: true
  },
  isOrderRelated: {
    type: Boolean,
    default: true
  },
  uploaded: {
    type: Boolean,
    required: true
  },
  orderId: {
    type: String,
    required: false
  },
  orderStatus: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
AttachmentSchema.method({
});

/**
 * Statics
 */
AttachmentSchema.statics = {
  /**
   * Get attachment
   * @param {ObjectId} id - The objectId of attachment.
   * @returns {Promise<Attachment, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((attachment) => {
        if (attachment) {
          return attachment;
        }
        const err = new APIError('No such attachment exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List attachments in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of attachments to be skipped.
   * @param {number} limit - Limit number of attachments to be returned.
   * @returns {Promise<Attachment[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef Attachment
 */
export default mongoose.model('Attachment', AttachmentSchema);

