import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Pilot Schema
 */
const PilotSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  teams: {
    type: [mongoose.Schema.ObjectId],
    required: true
  },
  license: {
    type: String,
    required: true
  },
  transportType: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  isActive: {
    type: Boolean,
    required: false
  },
  isAvailable: {
    type: Boolean,
    required: false
  },
  // TO DO : IDK!
  status: {
    type: String,
    required: false
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  // TO DO : IDK!
  last_updated_location_time: {
    type: String,
    required: false
  },
  last_updated_date_time: {
    type: String,
    required: false
  },
  registration_status: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
