import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

import utilCtrl  from '../controllers/util.controller'

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.connection.close();
    done();
});

describe('## User APIs', () => {
    let user = {
        username: 'KK123',
        mobileNumber: '1234567890'
    };

    let pilot = {
        userId: '',
        teams: ['magic'],
        location : {
            "type": "Point",
            "coordinates": [78,78]
        },
        isActive: false
    };

    let order = {
      "title": "Order TZ",
      "description": "desc TZ",
      "from_name": "po",
      "from_phone": "6088885568",
      "from_email": "pooii@ghh.vhh",
      "team" : "magic",
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
        "coordinates": [
          72.8183134,
          18.9537342
        ],
        "type": "Point"
      },
      "from_location": {
        "coordinates": [
          72.9050809,
          19.1196773
        ],
        "type": "Point"
      }
    };

    describe('# POST /api/users', () => {
        it('should create a new user', (done) => {
            request(app)
                .post('/api/users')
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).to.equal(user.username);
                    expect(res.body.mobileNumber).to.equal(user.mobileNumber);
                    user = res.body;
                    done();
                })
                .catch(done);
        });
    });

    describe('# POST /api/pilots', () => {
        it('should create a new pilot', (done) => {
            pilot.userId = user._id.toString();
            request(app)
                .post('/api/pilots')
                .send(pilot)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.userId).to.equal(pilot.userId);
                    pilot = res.body;
                    done();
                })
                .catch(done);
        });
    });

    describe('# POST /api/orders', () => {
        it('should create a new order', (done) => {
            request(app)
                .post('/api/orders')
                .send(order)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.title).to.equal(order.title);
                    order = res.body;
                    done();
                })
                .catch(done);
        });
    });


    describe('# DELETE /api/users/', () => {
        it('should delete user', (done) => {
            request(app)
                .delete(`/api/users/${user._id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).to.equal('KK123');
                    expect(res.body.mobileNumber).to.equal(user.mobileNumber);
                    done();
                })
                .catch(done);
        });
    });

    describe('# DELETE /api/pilots/', () => {
        it('should delete pilot', (done) => {
            request(app)
                .delete(`/api/pilots/${pilot._id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body._id).to.equal(pilot._id);
                    done();
                })
                .catch(done);
        });
    });

    describe('# DELETE /api/orders/', () => {
        it('should delete order', (done) => {
            request(app)
                .delete(`/api/orders/${order._id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body._id).to.equal(order._id.toString());
                    done();
                })
                .catch(done);
        });
    });
});
