import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * UserRole Schema
 * ADMIN
 * MANAGER
 * PILOT
 * MERCHANT
 * CUSTOMER
 */
const UserRoleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  previliges: {
    type: [mongoose.Schema.ObjectId],
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
});

