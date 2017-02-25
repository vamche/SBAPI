import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import User from '../models/user.model';
import Pilot from '../models/pilot.model';
import Manager from '../models/manager.model';
import Customer from '../models/customer.model';


const config = require('../../config/env');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
    User.getByUsername(req.body.username)
        .then((user) => {
            if(user.password === req.body.password) {
                if(req.body.userRole === 'PILOT'){
                  Pilot.getByUserId(user._id.toString())
                      .then(pilot => {
                          const token = jwt.sign({
                              username: user.username
                          }, config.jwtSecret);
                          pilot.user.password = 'XXXXXXXXX';
                          return res.json({
                              token,
                              username: user.username,
                              pilotId: pilot._id,
                              pilot: pilot
                          });
                      })
                      .catch(e => {
                        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
                        return next(err);
                      });
                }else if(req.body.userRole === 'MANAGER'){
                  Manager.getByUserId(user._id.toString())
                    .then(manager => {
                      const token = jwt.sign({
                        username: user.username
                      }, config.jwtSecret);
                      manager.user.password = 'XXXXXXXXX';
                      return res.json({
                        token,
                        username: user.username,
                        manager: manager
                      });
                    })
                    .catch(e => {
                      const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
                      return next(err);
                    });
                }else if(req.body.userRole === 'CUSTOMER'){
                  Customer.getByUserId(user._id.toString())
                    .then(customer => {
                      const token = jwt.sign({
                        username: user.username
                      }, config.jwtSecret);
                      customer.user.password = 'XXXXXXXXX';
                      return res.json({
                        token,
                        username: user.username,
                        customer: customer
                      });
                    })
                    .catch(e => {
                      const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
                      return next(err);
                    });
                }
            }
        })
        .catch(e => {
            const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
            return next(err);
        });
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

export default { login, getRandomNumber };
