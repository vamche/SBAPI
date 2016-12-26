import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * UserRole Schema
 * ASSIGN_TASK
 * CREATE_PILOT
 * CREATE_TASK
 * CREATE_MANAGER
 * CUSTOMER
 */
const PrivilgeSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  title: {
    type: Number,
    default: 0
  },
  description: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

