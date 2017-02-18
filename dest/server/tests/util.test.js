'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _supertestAsPromised = require('supertest-as-promised');

var _supertestAsPromised2 = _interopRequireDefault(_supertestAsPromised);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _index = require('../../index');

var _index2 = _interopRequireDefault(_index);

var _util = require('../controllers/util.controller');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.config.includeStack = true;

/**
 * root level hooks
 */
after(function (done) {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    _mongoose2.default.models = {};
    _mongoose2.default.modelSchemas = {};
    _mongoose2.default.connection.close();
    done();
});

describe('## User APIs', function () {
    var user = {
        username: 'KK123',
        mobileNumber: '1234567890'
    };

    var pilot = {
        userId: '',
        teams: ['magic'],
        location: {
            "type": "Point",
            "coordinates": [78, 78]
        },
        isActive: false
    };

    var order = {
        "title": "Order TZ",
        "description": "desc TZ",
        "from_name": "po",
        "from_phone": "6088885568",
        "from_email": "pooii@ghh.vhh",
        "team": "magic",
        "from_address": "Powai, Mumbai, Maharashtra, India",
        "to_name": "po",
        "to_phone": "8963257410",
        "to_email": "",
        "to_address": "Opera House, Girgaon, Mumbai, Maharashtra 400004, India",
        "paymentType": "PREPAID",
        "status": "PENDING",
        "__v": 0,
        "tags": ["we", "are", "good", "to", "go"],
        "time_in_seconds": 0,
        "distance_in_meters": 0,
        "timeline": [],
        "images": [],
        "timeZone": 530,
        "to_location": {
            "coordinates": [72.8183134, 18.9537342],
            "type": "Point"
        },
        "from_location": {
            "coordinates": [72.9050809, 19.1196773],
            "type": "Point"
        }
    };

    describe('# POST /api/users', function () {
        it('should create a new user', function (done) {
            (0, _supertestAsPromised2.default)(_index2.default).post('/api/users').send(user).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body.username).to.equal(user.username);
                (0, _chai.expect)(res.body.mobileNumber).to.equal(user.mobileNumber);
                user = res.body;
                done();
            }).catch(done);
        });
    });

    describe('# POST /api/pilots', function () {
        it('should create a new pilot', function (done) {
            pilot.userId = user._id.toString();
            (0, _supertestAsPromised2.default)(_index2.default).post('/api/pilots').send(pilot).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body.userId).to.equal(pilot.userId);
                pilot = res.body;
                done();
            }).catch(done);
        });
    });

    describe('# POST /api/orders', function () {
        it('should create a new order', function (done) {
            (0, _supertestAsPromised2.default)(_index2.default).post('/api/orders').send(order).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body.title).to.equal(order.title);
                order = res.body;
                done();
            }).catch(done);
        });
    });

    describe('# DELETE /api/users/', function () {
        it('should delete user', function (done) {
            (0, _supertestAsPromised2.default)(_index2.default).delete('/api/users/' + user._id).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body.username).to.equal('KK123');
                (0, _chai.expect)(res.body.mobileNumber).to.equal(user.mobileNumber);
                done();
            }).catch(done);
        });
    });

    describe('# DELETE /api/pilots/', function () {
        it('should delete pilot', function (done) {
            (0, _supertestAsPromised2.default)(_index2.default).delete('/api/pilots/' + pilot._id).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body._id).to.equal(pilot._id);
                done();
            }).catch(done);
        });
    });

    describe('# DELETE /api/orders/', function () {
        it('should delete order', function (done) {
            (0, _supertestAsPromised2.default)(_index2.default).delete('/api/orders/' + order._id).expect(_httpStatus2.default.OK).then(function (res) {
                (0, _chai.expect)(res.body._id).to.equal(order._id.toString());
                done();
            }).catch(done);
        });
    });
});
//# sourceMappingURL=util.test.js.map
