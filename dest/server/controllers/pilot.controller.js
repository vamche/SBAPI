'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _pilot = require('../models/pilot.model');

var _pilot2 = _interopRequireDefault(_pilot);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _order = require('../models/order.model');

var _order2 = _interopRequireDefault(_order);

var _timesheet = require('../models/timesheet.model');

var _timesheet2 = _interopRequireDefault(_timesheet);

var _manager = require('../models/manager.model');

var _manager2 = _interopRequireDefault(_manager);

var _franchise = require('../models/franchise.model');

var _franchise2 = _interopRequireDefault(_franchise);

var _attachment = require('../models/attachment.model');

var _attachment2 = _interopRequireDefault(_attachment);

var _printer = require('pdfmake/src/printer');

var _printer2 = _interopRequireDefault(_printer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');

function sendSMS(mobiles, message, route) {
  var url = 'https://control.msg91.com/api/sendhttp.php?authkey=113219ATt8BmevKtDK5742a5f9&mobiles=' + mobiles + '&message=' + message + '&sender=SSNBOY&route=' + route + '&country=0';
  return _axios2.default.get(url).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
}

/**
 * Load pilot and append to req.
 */
function load(req, res, next, id) {
  _pilot2.default.get(id).then(function (pilot) {
    req.pilot = pilot; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get pilot
 * @returns {Pilot}
 */
function get(req, res) {
  return res.json(req.pilot);
}

function getUnAssignedPilotsByTeam(team) {
  var isActive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var franchise = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (team === 'ALL' || team === '*' || team === '' || team === null) {
    return _pilot2.default.find().where('isAvailable', true).where('isActive', isActive).where('franchise', franchise);
  } else {
    return _pilot2.default.find().where('isAvailable', true).where('isActive', isActive).where('franchise', franchise).where('teams').in([team]);
  }
}

/**
 * Create new pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function create(req, res, next) {

  if (req.body.image) {
    (function () {
      var img = req.body.image;
      uploadImgAsync(img.source).then(function (res) {

        var attachment = new new _attachment2.default({
          source: result.url,
          isOrderRelated: false,
          type: img.type,
          extension: img.extension
        })();

        attachment.save().then(function (savedAttachment) {
          var user = new _user2.default({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: req.body.password,
            mobileNumber: req.body.mobileNumber,
            emailAddress: req.body.emailAddress,
            image: savedAttachment._id
          });

          user.save().then(function (savedUser) {
            var pilot = new _pilot2.default({
              user: savedUser._id,
              teams: req.body.teams,
              franchise: req.body.franchise ? req.body.franchise : null
            });
            pilot.save().then(function (savedPilot) {
              sendSMS('91' + savedUser.mobileNumber, 'Hi ' + savedUser.firstName + ', you have been added as a SB Pilot by Seasonboy. Download the app from play store. \n                       Username: ' + savedUser.username + ' & Password: ' + savedUser.password, 4);
              res.json(savedPilot);
            }).catch(function (e) {
              return next(e);
            });
          }).catch(function (e) {
            return next(e);
          });
        }).catch(function (e) {
          return next(e);
        });
      });
    })();
  } else {
    var user = new _user2.default({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      mobileNumber: req.body.mobileNumber,
      emailAddress: req.body.emailAddress
    });

    user.save().then(function (savedUser) {
      var pilot = new _pilot2.default({
        user: savedUser._id,
        teams: req.body.teams,
        franchise: req.body.franchise ? req.body.franchise : null
      });
      pilot.save().then(function (savedPilot) {
        sendSMS('91' + savedUser.mobileNumber, 'Hi ' + savedUser.firstName + ', you have been added as a SB Pilot by Seasonboy. Download the app from play store. Username: ' + savedUser.username + '  Password: ' + savedUser.password, 4);
        res.json(savedPilot);
      }).catch(function (e) {
        return next(e);
      });
    }).catch(function (e) {
      return next(e);
    });
  }
}

function createPilot(req, res, next) {

  var user = new _user2.default({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress
  });

  user.save().then(function (savedUser) {
    var customer = new _pilot2.default({
      user: savedUser._id,
      teams: req.body.teams,
      location: req.body.location
    });
    customer.save().then(function (savedCustomer) {
      res.json(savedCustomer);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function updateLocation(req, res, next) {
  var pilot = req.pilot;
  pilot.location = req.body.location;
  pilot.battery = req.body.battery;
  //pilot.isAvailable = req.body.isAvailable;
  pilot.save().then(function (savedPilot) {
    return res.json(savedPilot);
  }).catch(function (e) {
    return next(e);
  });
}

function updateTeams(req, res, next) {
  var pilot = req.pilot;
  pilot.teams = req.body.teams;
  pilot.save().then(function (savedPilot) {
    return res.json(savedPilot);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Update existing pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function update(req, res, next) {
  var pilot = req.pilot;
  pilot.teams = req.body.teams;
  pilot.save().then(function (savedPilot) {
    return res.json(savedPilot);
  }).catch(function (e) {
    return next(e);
  });
}

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 1000 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  var franchise = req.body.franchise;

  if (req.body.franchise) {
    _pilot2.default.listByFranchise({ limit: limit, skip: skip, franchise: franchise }).then(function (pilots) {
      return res.json(pilots);
    }).catch(function (e) {
      return next(e);
    });
  } else {
    _pilot2.default.list({ limit: limit, skip: skip }).then(function (pilots) {
      return res.json(pilots);
    }).catch(function (e) {
      return next(e);
    });
  }
}

/**
 * Delete pilot.
 * @returns {Pilot}
 */
function remove(req, res, next) {
  var pilot = req.pilot;
  pilot.remove().then(function (deletedPilot) {
    return res.json(deletedPilot);
  }).catch(function (e) {
    return next(e);
  });
}

function getSales(req, res, next) {
  var _req$body = req.body,
      _req$body$fromDate = _req$body.fromDate,
      fromDate = _req$body$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$fromDate,
      _req$body$toDate = _req$body.toDate,
      toDate = _req$body$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body$toDate;

  var sales = []; // Array of {_id: String, title: String, sales: String}
  var promises = void 0;
  var franchise = req.body.franchise;
  _pilot2.default.find().then(function (pilots) {
    promises = pilots.map(function (pilot) {
      var total = 0;
      var p = _order2.default.find().where('pilot', pilot._id.toString()).where('franchise', franchise).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
        orders.forEach(function (order) {
          total = total + order.final_cost;
        });
        sales.push({
          '_id': pilot._id,
          'name': pilot.name,
          'sales': total
        });
      }).catch(function (e) {
        return next(e);
      });
      return p;
    });
    _bluebird2.default.all(promises).then(function () {
      return res.json(sales);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function getSalesByPilot(req, res, next) {
  var _req$body2 = req.body,
      _req$body2$fromDate = _req$body2.fromDate,
      fromDate = _req$body2$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$fromDate,
      _req$body2$toDate = _req$body2.toDate,
      toDate = _req$body2$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body2$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}
  _order2.default.find().where('pilot', req.pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).then(function (orders) {
    var total = 0;
    orders.forEach(function (order) {
      total = total + order.final_cost;
    });
    sales = {
      '_id': req.pilot._id,
      'name': req.pilot.name,
      'sales': total,
      'orders': orders
    };
    res.json(sales);
  }).catch(function (e) {
    return next(e);
  });
}

function getTimesheets(req, res, next) {
  var _req$body3 = req.body,
      _req$body3$fromDate = _req$body3.fromDate,
      fromDate = _req$body3$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$fromDate,
      _req$body3$toDate = _req$body3.toDate,
      toDate = _req$body3$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body3$toDate;

  var times = []; // Array of {_id: String, title: String, sales: String}
  var promises = void 0;
  _pilot2.default.find().then(function (pilots) {
    promises = pilots.map(function (pilot) {
      var total = 0;
      var p = _timesheet2.default.find().where('pilot', pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).sort({ createdAt: 1 }).then(function (timesheets) {
        var diff = 0;
        var len = 0;
        timesheets.forEach(function (timesheet) {
          len++;
          if (len === 1) {
            if (timesheet.isAvailable) {
              diff -= (0, _moment2.default)(timesheet.createdAt).unix();
            } else {
              diff -= (0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').unix();
              diff += (0, _moment2.default)(timesheet.createdAt).unix();
            }
          } else if (len === timesheets.length) {
            if (!timesheet.isAvailable) {
              diff += (0, _moment2.default)(timesheet.createdAt).unix();
            } else {
              diff -= (0, _moment2.default)(timesheet.createdAt).unix();
              if (toDate === (0, _moment2.default)().format('YYYYMMDD')) {
                diff += (0, _moment2.default)().unix();
              } else {
                diff += (0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').unix();
              }
            }
          } else {
            if (timesheet.isAvailable) {
              diff -= (0, _moment2.default)(timesheet.createdAt).unix();
            } else {
              diff += (0, _moment2.default)(timesheet.createdAt).unix();
            }
          }
        });
        times.push({
          '_id': pilot._id,
          'name': pilot.name,
          'time': diff / (60 * 60),
          'timesheets': timesheets
        });
      }).catch(function (e) {
        return next(e);
      });
      return p;
    });
    _bluebird2.default.all(promises).then(function () {
      return res.json(times);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function getTimesheetsByPilot(req, res, next) {
  var _req$body4 = req.body,
      _req$body4$fromDate = _req$body4.fromDate,
      fromDate = _req$body4$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body4$fromDate,
      _req$body4$toDate = _req$body4.toDate,
      toDate = _req$body4$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body4$toDate;

  var sales = void 0; // {_id: String, title: String, sales: String}
  var times = void 0;
  _timesheet2.default.find().where('pilot', req.pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day')).sort({ createdAt: 1 }).then(function (timesheets) {
    var diff = 0;
    var len = 0;
    timesheets.forEach(function (timesheet) {
      len++;
      if (len === 1) {
        if (timesheet.isAvailable) {
          diff -= (0, _moment2.default)(timesheet.createdAt).unix();
        } else {
          diff -= (0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').unix();
          diff += (0, _moment2.default)(timesheet.createdAt).unix();
        }
      } else if (len === timesheets.length) {
        if (!timesheet.isAvailable) {
          diff += (0, _moment2.default)(timesheet.createdAt).unix();
        } else {
          diff -= (0, _moment2.default)(timesheet.createdAt).unix();
          if (toDate === (0, _moment2.default)().format('YYYYMMDD')) {
            diff += (0, _moment2.default)().unix();
          } else {
            diff += (0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').unix();
          }
        }
      } else {
        if (timesheet.isAvailable) {
          diff -= (0, _moment2.default)(timesheet.createdAt).unix();
        } else {
          diff += (0, _moment2.default)(timesheet.createdAt).unix();
        }
      }
    });
    times = {
      '_id': req.pilot._id,
      'name': req.pilot.name,
      'time': diff / (60 * 60),
      'timesheets': timesheets
    };
    res.json(times);
  }).catch(function (e) {
    return next(e);
  });
}

function stats(req, res, next) {
  var teams = [];
  var team = req.body.team;
  var getPilots = void 0;
  var franchise = req.body.franchise;
  if (franchise) {
    getPilots = _pilot2.default.find().where('franchise', franchise);
  } else if (team && team != '*' && team != 'ALL' && teams != '') {
    teams = [team];
    getPilots = _pilot2.default.find().where('franchise', franchise).where('teams').in(teams);
  } else {
    getPilots = _pilot2.default.find().where('franchise', franchise);
  }
  getPilots.then(function (pilots) {
    var stats = {
      available: 0,
      offline: 0,
      total: 0
    };
    pilots.forEach(function (pilot) {
      if (pilot.isAvailable) {
        stats.available++;
      } else {
        stats.offline++;
      }
      stats.total++;
    });
    res.json(stats);
  }).catch(function (e) {
    return next(e);
  });
}

function listByManager(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === undefined ? 500 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === undefined ? 0 : _req$query2$skip;
  var _req$body5 = req.body,
      team = _req$body5.team,
      manager = _req$body5.manager,
      franchise = _req$body5.franchise;


  if (!team || team === '' || team === '*' || team === 'ALL') {
    _manager2.default.get(manager).then(function (manager) {
      if (manager.isAdmin) {
        _pilot2.default.list({ limit: limit, skip: skip, franchise: franchise }).then(function (pilots) {
          return res.json(pilots);
        }).catch(function (e) {
          return next(e);
        });
      } else if (manager.isFranchiseAdmin) {
        _pilot2.default.listByFranchise({ limit: limit, skip: skip, franchise: franchise }).then(function (pilots) {
          return res.json(pilots);
        }).catch(function (e) {
          return next(e);
        });
      } else {
        _pilot2.default.find().where('franchise', franchise).where('teams').in(manager.teams).then(function (pilots) {
          return res.json(pilots);
        }).catch(function (e) {
          return next(e);
        });
      }
    });
  } else {
    listByTeam(req, res, next);
  }
}

function listByTeam(req, res, next) {
  var team = req.body.team;
  _pilot2.default.find().where('teams').in([team]).then(function (pilots) {
    return res.json(pilots);
  }).catch(function (e) {
    return next(e);
  });
}

function updateAvailability(req, res, next) {
  var pilot = req.pilot;
  pilot.isAvailable = req.body.isAvailable;
  pilot.location = req.body.location ? req.body.location : pilot.location;
  pilot.battery = req.body.battery ? req.body.battery : pilot.battery;
  pilot.save().then(function (savedPilot) {
    var timesheet = new _timesheet2.default({
      isAvailable: savedPilot.isAvailable,
      pilot: savedPilot._id.toString(),
      location: savedPilot.location
    });
    timesheet.save().then(function (timesheet) {
      return res.json(timesheet);
    }).catch(function (e) {
      return next(e);
    });
  }).catch(function (e) {
    return next(e);
  });
}

function getActivity(req, res, next) {
  var pilot = req.pilot;
  var pilotId = pilot._id.toString();
  var _req$query3 = req.query,
      _req$query3$limit = _req$query3.limit,
      limit = _req$query3$limit === undefined ? 100 : _req$query3$limit,
      _req$query3$skip = _req$query3.skip,
      skip = _req$query3$skip === undefined ? 0 : _req$query3$skip;
  var _req$body6 = req.body,
      date = _req$body6.date,
      timeZone = _req$body6.timeZone;

  _order2.default.listByPilotAndDate({ pilot: pilotId, date: date, timeZone: timeZone, limit: limit, skip: skip }).then(function (orders) {
    var completed = 0;
    var assigned = 0;
    var distance = 0;
    var amount = 0;
    var activeOrder = {};
    orders.forEach(function (o) {
      distance += o.distance_in_meters;
      amount += o.final_cost;
      if (o.status == 'COMPLETED' || o.status == 'FAILED') {
        completed++;
      } else {
        assigned++;
      }
      if (o.status != 'ASSIGNED' && o.status != 'COMPLETED' && o.status != 'FAILED') {
        activeOrder = o;
      }
    });
    pilot.user.password = 'XXXXXXXXX';
    res.json({
      completed: completed,
      assigned: assigned,
      distanceInMeters: distance,
      amount: amount,
      pilot: pilot,
      orders: orders,
      activeOrder: activeOrder
    });
  }).catch(function (e) {
    return next(e);
  });
}

function getReport1(req, res, next) {
  var pilot = req.pilot;
  var _req$body7 = req.body,
      franchise = _req$body7.franchise,
      _req$body7$fromDate = _req$body7.fromDate,
      fromDate = _req$body7$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body7$fromDate,
      _req$body7$toDate = _req$body7.toDate,
      toDate = _req$body7$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body7$toDate,
      _req$body7$timeZone = _req$body7.timeZone,
      timeZone = _req$body7$timeZone === undefined ? 'Europe/London' : _req$body7$timeZone;

  var diffInMinutes = (0, _moment2.default)().tz(timeZone).utcOffset();

  _order2.default.find().where('pilot', pilot._id.toString()).where('franchise', franchise).where('createdBy', customer._id.toString()).where('createdAt').gte((0, _moment2.default)(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _moment2.default)(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).then(function (orders) {}).catch(function (e) {
    return next(e);
  });
}

function createPdfBinary(pdfDoc, callback) {

  var fonts = {
    Roboto: {
      normal: './fonts/Roboto-Regular.ttf',
      bold: './fonts/Roboto-Medium.ttf',
      italics: './fonts/Roboto-Italic.ttf',
      bolditalics: './fonts/Roboto-Italic.ttf'
    }
  };

  var printer = new _printer2.default(fonts);

  var doc = printer.createPdfKitDocument(pdfDoc, { autoPrint: true });

  var chunks = [];
  var result;

  doc.on('data', function (chunk) {
    chunks.push(chunk);
  });
  doc.on('end', function () {
    result = Buffer.concat(chunks);
    callback('data:application/pdf;base64,' + result.toString('base64'));
  });
  doc.end();
}

function getReport2(req, res, next) {
  var docDefinition = {
    info: {
      title: 'awesome Document',
      author: 'john doe',
      subject: 'subject of document',
      keywords: 'keywords for document'
    },
    content: ['First paragraph', 'Second paragraph, this time a little bit longer', { text: 'Third paragraph, slightly bigger font size', fontSize: 20 }, { text: 'Another paragraph using a named style', style: 'header' }, { text: ['playing with ', 'inlines'] }, { text: ['and ', { text: 'restyling ', bold: true }, 'them'] }],
    styles: {
      header: { fontSize: 30, bold: true }
    }
  };
  createPdfBinary(docDefinition, function (binary) {
    res.contentType('application/pdf');
    //res.header('Content-Disposition', 'attachment; filename=' + 'report.pdf');
    res.send(binary);
  }, function (error) {
    res.send('ERROR:' + error);
  });
}

function getReport(req, res, next) {

  var pilot = req.pilot;
  var _req$body8 = req.body,
      franchise = _req$body8.franchise,
      _req$body8$fromDate = _req$body8.fromDate,
      fromDate = _req$body8$fromDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body8$fromDate,
      _req$body8$toDate = _req$body8.toDate,
      toDate = _req$body8$toDate === undefined ? (0, _moment2.default)().format('YYYYMMDD') : _req$body8$toDate,
      _req$body8$timeZone = _req$body8.timeZone,
      timeZone = _req$body8$timeZone === undefined ? 'Europe/London' : _req$body8$timeZone;

  var diffInMinutes = (0, _moment2.default)().tz(timeZone).utcOffset();

  var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

  var printer = new _printer2.default(fonts);

  var docDefinition = {
    info: {
      title: 'Pilot Report'
    },
    content: [{ text: 'Season Boy', style: 'header' }, 'Franchise:' + (pilot.franchise ? pilot.franchise.name : ''), '\n', pilot.user.firstName + ' ' + pilot.user.lastName, 'Mobile: ' + pilot.user.mobileNumber, '\n', 'From date: ' + (0, _moment2.default)(fromDate, "YYYYMMDD").format('MMMM Do YYYY'), 'To date: ' + (0, _moment2.default)(toDate, "YYYYMMDD").format('MMMM Do YYYY'), '\n \n'],
    styles: {
      header: { fontSize: 20, bold: true }
    }
  };

  _order2.default.find().where('pilot', pilot._id.toString()).where('createdAt').gte((0, _moment2.default)(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes')).lte((0, _moment2.default)(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes')).then(function (orders) {

    var orderRows = [];
    var totalDistance = 0;
    var totalTime = 0;

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];

      totalDistance += order.distance_in_meters;
      totalTime += order.time_in_seconds;

      orderRows.push([order.id ? order.id : 'NA', order.status ? order.status : '', (order.distance_in_meters / 1000).toFixed(2), (order.time_in_seconds / 3600).toFixed(2)]);
    }

    var ordersContent = {
      style: 'tableExample',
      table: {
        widths: [100, '*', 200, '*'],
        body: [['Order id', 'Status', 'Distance (Kms)', 'Duration (Hrs)']]
      }
    };

    ordersContent.table.body = ordersContent.table.body.concat(orderRows);
    docDefinition['content'].push(ordersContent);

    docDefinition['content'].push('\nTotal Kms: ' + (totalDistance / 1000).toFixed(2) + ' Kms');
    docDefinition['content'].push('\nNumber of orders: ' + orders.length);

    var fileName = 'reports/' + 'Pilot' + 'Report' + '.pdf';

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(fileName)).on('finish', function () {
      res.download(fileName);
    });

    pdfDoc.end();
  }).catch(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load, get: get, create: create, update: update, list: list, remove: remove, updateLocation: updateLocation, updateTeams: updateTeams,
  getUnAssignedPilotsByTeam: getUnAssignedPilotsByTeam, createPilot: createPilot, getSales: getSales, getSalesByPilot: getSalesByPilot, getTimesheets: getTimesheets, getTimesheetsByPilot: getTimesheetsByPilot,
  stats: stats, listByTeam: listByTeam, updateAvailability: updateAvailability, listByManager: listByManager, getActivity: getActivity, getReport: getReport };
module.exports = exports['default'];
//# sourceMappingURL=pilot.controller.js.map
