import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Job Schema
 */
const JobSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  team: {
    type: mongoose.Schema.ObjectId,
    required: false
  },
  pilot: {
    type: mongoose.Schema.ObjectId,
    required: false
  },
  from_name: {
    type: String,
    required: true
  },
  from_phone: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  from_email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  from_address: {
    type: String,
    required: false
  },
  from_latitiude: {
    type: Number,
    required: false
  },
  from_longitude: {
    type: Number,
    required: false
  },
  from_date_time: {
    type: Number,
    required: false
  },
  to_name: {
    type: String,
    required: true
  },
  to_phone: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  to_email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  to_address: {
    type: String,
    required: false
  },
  to_latitiude: {
    type: Number,
    required: false
  },
  to_longitude: {
    type: Number,
    required: false
  },
  to_date_time: {
    type: Number,
    required: false
  },
  timeZone: {
    type: Number,
    default: 530
  },
  images: {
    type: [mongoose.Schema.ObjectId],
    required: false
  },
  rating: {
    type: Number,
    required: false
  },
  status: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  acknowledged_notes: {
    type: String,
    required: false
  },
  acknowledged_signature: {
    type: String,
    required: false
  },
  acknowledged_image: {
    type: String,
    required: false
  },
  acknowledged_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_movement: {
    type: [Object],
    required: false
  },
  pilot_from_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_to_date_time: {
    type: Date,
    default: Date.now
  },
  pilot_completed_date_time: {
    type: Date,
    default: Date.now
  },
  distance_in_meters: {
    type: Number,
    default: 0
  },
  time_in_seconds: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    required: false
  },
  paymentType: {
    type: mongoose.Schema.ObjectId,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

