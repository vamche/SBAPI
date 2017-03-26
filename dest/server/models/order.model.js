'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _mongooseAutoIncrement = require('mongoose-auto-increment');

var _mongooseAutoIncrement2 = _interopRequireDefault(_mongooseAutoIncrement);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Job Schema
 */
var OrderSchema = new _mongoose2.default.Schema({
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
    type: String,
    required: false
  },
  pilot: {
    type: String, // mongoose.Schema.ObjectId,
    required: false,
    ref: 'Pilot',
    default: null
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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  from_address: {
    type: String,
    required: false
  },
  from_location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  from_date_time: {
    type: Date,
    default: Date.now(),
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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'The value of path {PATH} ({VALUE}) is not a valid email address'],
    required: false
  },
  to_address: {
    type: String,
    required: false
  },
  to_location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  to_date_time: {
    type: Date,
    default: Date.now(),
    required: false
  },
  timeZone: {
    type: Number,
    default: 530
  },
  attachments: {
    type: [{ type: String, ref: 'Attachment' }],
    required: false,
    default: []
  },
  rating: {
    type: Number,
    required: false
  },
  status: {
    type: String, // mongoose.Schema.ObjectId,
    required: true
  },
  timeline: {
    type: [[String]], // [[ status, datetime, location ]]
    required: false,
    default: [[]]
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
    type: {
      type: String,
      default: 'LineString'
    },
    coordinates: [[Number]]

  },
  pilot_start_date_time: {
    type: Date,
    default: Date.now
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
    type: String, // mongoose.Schema.ObjectId,
    required: false
  },
  createdBy: {
    type: String, // merchant ID
    required: false
  },
  final_cost: {
    type: Number, // INR
    default: 0,
    required: false
  },
  payment_pending: {
    type: Boolean,
    default: true,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.index({ from_location: '2dsphere' });
OrderSchema.index({ to_location: '2dsphere' });

_mongooseAutoIncrement2.default.initialize(_mongoose2.default.connection);

OrderSchema.plugin(_mongooseAutoIncrement2.default.plugin, {
  model: 'Order',
  field: 'id',
  startAt: 1000000,
  incrementBy: 1
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
OrderSchema.method({});

/**
 * Statics
 */
OrderSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).populate('attachments').populate({
      path: 'pilot',
      populate: { path: 'user' } }).exec().then(function (order) {
      if (order) {
        return order;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },


  /**
   * List orders in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of orders to be skipped.
   * @param {number} limit - Limit number of orders to be returned.
   * @returns {Promise<Order[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().populate('attachments').populate({
      path: 'pilot',
      populate: { path: 'user' } }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByPilotAndDate: function listByPilotAndDate() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        pilot = _ref2.pilot,
        date = _ref2.date,
        _ref2$timeZone = _ref2.timeZone,
        timeZone = _ref2$timeZone === undefined ? 'Europe/London' : _ref2$timeZone,
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 50 : _ref2$limit;

    var diffInMinutes = (0, _momentTimezone2.default)().tz(timeZone).utcOffset();
    return this.find().where('pilot', pilot).where('createdAt').gte((0, _momentTimezone2.default)(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _momentTimezone2.default)(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).populate('attachments').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByTeamAndDate: function listByTeamAndDate() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        team = _ref3.team,
        date = _ref3.date,
        _ref3$skip = _ref3.skip,
        skip = _ref3$skip === undefined ? 0 : _ref3$skip,
        _ref3$limit = _ref3.limit,
        limit = _ref3$limit === undefined ? 1000 : _ref3$limit;

    return this.find().where('team', team).where('createdAt').gte((0, _momentTimezone2.default)(date, "YYYYMMDD").startOf('day')).lte((0, _momentTimezone2.default)(date, "YYYYMMDD").endOf('day')).populate('attachments').populate({ path: 'pilot',
      populate: { path: 'user' } }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByDate: function listByDate() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        date = _ref4.date,
        _ref4$timeZone = _ref4.timeZone,
        timeZone = _ref4$timeZone === undefined ? 'Europe/London' : _ref4$timeZone,
        _ref4$skip = _ref4.skip,
        skip = _ref4$skip === undefined ? 0 : _ref4$skip,
        _ref4$limit = _ref4.limit,
        limit = _ref4$limit === undefined ? 1000 : _ref4$limit;

    var diffInMinutes = (0, _momentTimezone2.default)().tz(timeZone).utcOffset();
    return this.find().where('createdAt').gte((0, _momentTimezone2.default)(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _momentTimezone2.default)(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).populate('attachments').populate({
      path: 'pilot',
      populate: { path: 'user' } }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByCustomerAndDate: function listByCustomerAndDate() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        date = _ref5.date,
        _ref5$timeZone = _ref5.timeZone,
        timeZone = _ref5$timeZone === undefined ? 'Europe/London' : _ref5$timeZone,
        customer = _ref5.customer,
        _ref5$skip = _ref5.skip,
        skip = _ref5$skip === undefined ? 0 : _ref5$skip,
        _ref5$limit = _ref5.limit,
        limit = _ref5$limit === undefined ? 1000 : _ref5$limit;

    var diffInMinutes = (0, _momentTimezone2.default)().tz(timeZone).utcOffset();
    return this.find().where('createdAt').gte((0, _momentTimezone2.default)(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _momentTimezone2.default)(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).where('createdBy', customer).populate('attachments').populate({
      path: 'pilot',
      populate: { path: 'user' } }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByTeamsAndDate: function listByTeamsAndDate() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        date = _ref6.date,
        _ref6$timeZone = _ref6.timeZone,
        timeZone = _ref6$timeZone === undefined ? 'Europe/London' : _ref6$timeZone,
        teams = _ref6.teams,
        _ref6$skip = _ref6.skip,
        skip = _ref6$skip === undefined ? 0 : _ref6$skip,
        _ref6$limit = _ref6.limit,
        limit = _ref6$limit === undefined ? 1000 : _ref6$limit;

    var diffInMinutes = (0, _momentTimezone2.default)().tz(timeZone).utcOffset();
    return this.find().where('createdAt').gte((0, _momentTimezone2.default)(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _momentTimezone2.default)(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).where('team').in(teams).populate('attachments').populate('pilot').sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
  listByPilotDateRangeStatus: function listByPilotDateRangeStatus() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        pilot = _ref7.pilot,
        fromDate = _ref7.fromDate,
        toDate = _ref7.toDate,
        status = _ref7.status;

    return this.find().where('pilot', pilot).where('status', status).where('createdAt').gte((0, _momentTimezone2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _momentTimezone2.default)(toDate, "YYYYMMDD").endOf('day')).populate('attachments').populate('pilot').exec();
  },
  getUnAssigned: function getUnAssigned() {
    return this.find().or([{ 'status': 'PENDING' }, { 'pilot': null }]).exec();
  }
};

/**
 * @typedef Order
 */
exports.default = _mongoose2.default.model('Order', OrderSchema);
module.exports = exports['default'];
//# sourceMappingURL=order.model.js.map
