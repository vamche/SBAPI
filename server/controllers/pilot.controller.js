import BPromise from 'bluebird';
import moment from 'moment';
import axios from 'axios';

import Pilot from '../models/pilot.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import Timesheet from '../models/timesheet.model';
import Manager from '../models/manager.model';
import Franchise from '../models/franchise.model';
import Attachment from '../models/attachment.model';

import pdfMakePrinter from 'pdfmake/src/printer';
var fs = require('fs');

function sendSMS(mobiles, message, route) {
  const url = `https://control.msg91.com/api/sendhttp.php?authkey=113219ATt8BmevKtDK5742a5f9&mobiles=${mobiles}&message=${message}&sender=SSNBOY&route=${route}&country=0`;
  return axios.get(url)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Load pilot and append to req.
 */
function load(req, res, next, id) {
  Pilot.get(id)
    .then((pilot) => {
      req.pilot = pilot; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get pilot
 * @returns {Pilot}
 */
function get(req, res) {
  return res.json(req.pilot);
}

function getUnAssignedPilotsByTeam(team, isActive = false ,franchise = null){
  if(team === 'ALL' || team === '*' || team === '' || team === null){
    return Pilot.find()
      .where('isAvailable', true)
      .where('isActive', isActive)
      .where('franchise', franchise)
  }else {
    return Pilot.find()
      .where('isAvailable', true)
      .where('isActive', isActive)
      .where('franchise', franchise)
      .where('teams').in([team]);
  }
}

/**
 * Create new pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function create(req, res, next) {

  if(req.body.image) {
    const img = req.body.image;
    uploadImgAsync(img.source)
      .then(res => {

        const attachment = new new Attachment({
          source: result.url,
          isOrderRelated: false,
          type: img.type,
          extension: img.extension
        });

        attachment.save()
          .then(savedAttachment => {
            const user = new User({
              firstName : req.body.firstName,
              lastName : req.body.lastName,
              username : req.body.username,
              password : req.body.password,
              mobileNumber : req.body.mobileNumber,
              emailAddress : req.body.emailAddress,
              image : savedAttachment._id
            });

            user.save()
              .then(savedUser => {
                const pilot = new Pilot({
                  user : savedUser._id,
                  teams : req.body.teams,
                  franchise : req.body.franchise ? req.body.franchise : null
                });
                pilot.save()
                  .then(savedPilot => {
                    sendSMS(`91${savedUser.mobileNumber}`,
                      `Hi ${savedUser.firstName}, you have been added as a SB Pilot by Seasonboy. Download the app from play store. 
                       Username: ${savedUser.username} & Password: ${savedUser.password}`, 4);
                    res.json(savedPilot);
                  })
                  .catch(e => next(e));
              })
              .catch(e => next(e));

          })
          .catch(e => next(e));
      });
  } else {
    const user = new User({
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      username : req.body.username,
      password : req.body.password,
      mobileNumber : req.body.mobileNumber,
      emailAddress : req.body.emailAddress
    });

    user.save()
      .then(savedUser => {
        const pilot = new Pilot({
          user : savedUser._id,
          teams : req.body.teams,
          franchise : req.body.franchise ? req.body.franchise : null
        });
        pilot.save()
          .then(savedPilot => {
            sendSMS(`91${savedUser.mobileNumber}`,
              `Hi ${savedUser.firstName}, you have been added as a SB Pilot by Seasonboy. Download the app from play store. Username: ${savedUser.username}  Password: ${savedUser.password}`, 4);
            res.json(savedPilot);
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }
}


function createPilot(req, res, next){

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password,
        mobileNumber : req.body.mobileNumber,
        emailAddress : req.body.emailAddress
    });

    user.save()
        .then(savedUser => {
            const customer = new Pilot({
                user : savedUser._id,
                teams : req.body.teams,
                location : req.body.location
            });
            customer.save()
                .then(savedCustomer => {
                    res.json(savedCustomer);
                })
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function updateLocation(req, res, next) {
  const pilot = req.pilot;
  pilot.location = req.body.location;
  pilot.battery = req.body.battery;
  //pilot.isAvailable = req.body.isAvailable;
  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

function updateTeams(req, res, next) {
  const pilot = req.pilot;
  pilot.teams = req.body.teams;
  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

/**
 * Update existing pilot
 * @property {string} req.body.username - The username of pilot.
 * @property {string} req.body.mobileNumber - The mobileNumber of pilot.
 * @returns {Pilot}
 */
function update(req, res, next) {
  const pilot = req.pilot;
  pilot.teams = req.body.teams;
  pilot.save()
    .then(savedPilot => res.json(savedPilot))
    .catch(e => next(e));
}

/**
 * Get pilot list.
 * @property {number} req.query.skip - Number of Pilot to be skipped.
 * @property {number} req.query.limit - Limit number of Pilot to be returned.
 * @returns {Pilot[]}
 */
function list(req, res, next) {
  const { limit = 1000, skip = 0 } = req.query;
  const franchise = req.body.franchise;

  if(req.body.franchise) {
    Pilot.listByFranchise({ limit, skip, franchise})
      .then(pilots => res.json(pilots))
      .catch(e => next(e));
  }else {
    Pilot.list({ limit, skip })
      .then(pilots => res.json(pilots))
      .catch(e => next(e));
  }
}

/**
 * Delete pilot.
 * @returns {Pilot}
 */
function remove(req, res, next) {
  const pilot = req.pilot;
  pilot.remove()
    .then(deletedPilot => res.json(deletedPilot))
    .catch(e => next(e));
}

function getSales(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales = []; // Array of {_id: String, title: String, sales: String}
    let promises;
    const franchise = req.body.franchise;
    Pilot.find()
        .then(pilots => {
            promises = pilots.map(pilot => {
                let total = 0;
                const p = Order.find()
                    .where('pilot', pilot._id.toString())
                    .where('franchise', franchise)
                    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
                    .then(orders => {
                        orders.forEach(order => {
                            total = total + order.final_cost;
                        });
                        sales.push({
                            '_id' : pilot._id,
                            'name' : pilot.name,
                            'sales' : total
                        });
                    })
                    .catch(e => next(e));
                return p;
            });
            BPromise.all(promises)
                .then(() => res.json(sales))
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function getSalesByPilot(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}
    Order.find()
        .where('pilot', req.pilot._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .then(orders => {
            let total = 0;
            orders.forEach(order => {
                total = total + order.final_cost;
            });
            sales = {
                '_id' : req.pilot._id,
                'name' : req.pilot.name,
                'sales' : total,
                'orders' : orders
            };
            res.json(sales);
        })
        .catch(e => next(e));
}


function getTimesheets(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let times = []; // Array of {_id: String, title: String, sales: String}
    let promises;
    Pilot.find()
        .then(pilots => {
            promises = pilots.map(pilot => {
                let total = 0;
                const p = Timesheet.find()
                    .where('pilot', pilot._id.toString())
                    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
                    .sort({ createdAt: 1 })
                    .then(timesheets => {
                        let diff = 0;
                        let len = 0;
                        timesheets.forEach(timesheet => {
                            len++;
                            if(len === 1) {
                                if(timesheet.isAvailable){
                                    diff -= moment(timesheet.createdAt).unix();
                                }else{
                                    diff -= moment(fromDate, "YYYYMMDD").startOf('day').unix();
                                    diff += moment(timesheet.createdAt).unix();
                                }
                            }else if(len === timesheets.length){
                                if(!timesheet.isAvailable){
                                    diff += moment(timesheet.createdAt).unix();
                                }else{
                                    diff -= moment(timesheet.createdAt).unix();
                                    if(toDate === moment().format('YYYYMMDD')){
                                        diff += moment().unix();
                                    }else{
                                        diff += moment(toDate, "YYYYMMDD").endOf('day').unix();
                                    }
                                }
                            }else {
                                if(timesheet.isAvailable){
                                    diff -= moment(timesheet.createdAt).unix();
                                }else{
                                    diff += moment(timesheet.createdAt).unix();
                                }
                            }
                        });
                        times.push({
                            '_id' : pilot._id,
                            'name' : pilot.name,
                            'time' : diff/(60*60),
                            'timesheets' : timesheets
                        });
                    })
                    .catch(e => next(e));
                return p;
            });
            BPromise.all(promises)
                .then(() => res.json(times))
                .catch(e => next(e));
        })
        .catch(e => next(e));
}

function getTimesheetsByPilot(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}
    let times;
    Timesheet.find()
        .where('pilot', req.pilot._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .sort({ createdAt: 1 })
        .then(timesheets => {
            let diff = 0;
            let len = 0;
            timesheets.forEach(timesheet => {
                len++;
                if(len === 1) {
                    if(timesheet.isAvailable){
                        diff -= moment(timesheet.createdAt).unix();
                    }else{
                        diff -= moment(fromDate, "YYYYMMDD").startOf('day').unix();
                        diff += moment(timesheet.createdAt).unix();
                    }
                }else if(len === timesheets.length){
                    if(!timesheet.isAvailable){
                        diff += moment(timesheet.createdAt).unix();
                    }else{
                        diff -= moment(timesheet.createdAt).unix();
                        if(toDate === moment().format('YYYYMMDD')){
                            diff += moment().unix();
                        }else{
                            diff += moment(toDate, "YYYYMMDD").endOf('day').unix();
                        }
                    }
                }else {
                    if(timesheet.isAvailable){
                        diff -= moment(timesheet.createdAt).unix();
                    }else{
                        diff += moment(timesheet.createdAt).unix();
                    }
                }
            });
            times = {
                '_id' : req.pilot._id,
                'name' : req.pilot.name,
                'time' : diff/(60*60),
                'timesheets' : timesheets
            };
            res.json(times);
        })
        .catch(e => next(e));
}

function stats(req, res, next){
    let teams = [];
    const team = req.body.team;
    let getPilots;
    const franchise = req.body.franchise;
    if(franchise) {
      getPilots = Pilot.find()
        .where('franchise', franchise);
    } else if (team && team != '*' && team != 'ALL' && teams != '') {
      teams = [team];
      getPilots = Pilot.find()
        .where('franchise', franchise)
        .where('teams').in(teams);
    }else {
      getPilots = Pilot.find().where('franchise', franchise);
    }
      getPilots
      .then(pilots => {
        const stats = {
          available : 0,
          offline : 0,
          total: 0
        };
        pilots.forEach(pilot => {
          if (pilot.isAvailable) {
            stats.available++;
          }else {
            stats.offline++;
          }
          stats.total++;
        });
        res.json(stats);
      })
      .catch(e => next(e))

}

function listByManager(req, res, next) {
  const { limit = 500, skip = 0 } = req.query;
  const { team, manager, franchise } = req.body;

  if(!team || team === '' || team === '*' || team === 'ALL'){
    Manager.get(manager)
      .then(manager => {
        if(manager.isAdmin){
          Pilot.list({ limit, skip, franchise })
            .then(pilots => res.json(pilots))
            .catch(e => next(e));
        }else if(manager.isFranchiseAdmin) {
          Pilot.listByFranchise({ limit, skip, franchise})
            .then(pilots => res.json(pilots))
            .catch(e => next(e));
        }else {
          Pilot.find()
            .where('franchise', franchise)
            .where('teams').in(manager.teams)
            .then(pilots => res.json(pilots))
            .catch(e => next(e));
        }
      });
  }else {
    listByTeam(req, res, next);
  }
}

function listByTeam(req, res, next){
  const team = req.body.team;
  Pilot.find()
    .where('teams').in([team])
    .then(pilots => res.json(pilots))
    .catch(e => next(e));
}

function updateAvailability(req, res, next){
  const pilot = req.pilot;
  pilot.isAvailable = req.body.isAvailable;
  pilot.location = req.body.location ? req.body.location : pilot.location;
  pilot.battery = req.body.battery ? req.body.battery : pilot.battery;
  pilot.last_updated_location_time = Date.now();
  pilot.save()
    .then(savedPilot => {
      const timesheet = new Timesheet({
        isAvailable: savedPilot.isAvailable,
        pilot: savedPilot._id.toString(),
        location: savedPilot.location
      });
      timesheet.save()
        .then(timesheet => res.json(timesheet))
        .catch(e => next(e));

    })
    .catch(e => next(e));
}

function getActivity(req, res, next) {
  const pilot = req.pilot;
  const pilotId = pilot._id.toString();
  const { limit = 100, skip = 0 } = req.query;
  const { date, timeZone } = req.body;
  Order.listByPilotAndDate({pilot : pilotId, date, timeZone, limit, skip})
    .then(orders => {
      let completed = 0;
      let assigned = 0;
      let distance = 0;
      let amount = 0;
      let activeOrder = {};
      orders.forEach(o => {
        distance += o.distance_in_meters;
        amount +=  o.final_cost;
        if(o.status == 'COMPLETED' || o.status == 'FAILED'){
          completed++;
        }else {
          assigned++;
        }
        if(o.status != 'ASSIGNED' && o.status != 'COMPLETED' && o.status != 'FAILED') {
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
        activeOrder : activeOrder
      });
    })
    .catch(e => next(e));

}


function getReport1(req, res, next) {
  const pilot = req.pilot;
  const { franchise ,fromDate = moment().format('YYYYMMDD'),
    toDate = moment().format('YYYYMMDD'), timeZone = 'Europe/London' } = req.body;
  const diffInMinutes = moment().tz(timeZone).utcOffset();

  Order.find()
    .where('pilot', pilot._id.toString())
    .where('franchise', franchise)
    .where('createdBy', customer._id.toString())
    .where('createdAt').gte(moment(date, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
    .lte(moment(date, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
    .then(orders => {


    })
    .catch(e => next(e));

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

  var printer = new pdfMakePrinter(fonts);

  var doc = printer.createPdfKitDocument(pdfDoc , {autoPrint : true});

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
 const docDefinition = {
     	info: {
      		title: 'awesome Document',
      		author: 'john doe',
      		subject: 'subject of document',
      		keywords: 'keywords for document',
       	},
    	content: [
      		'First paragraph',
    		'Second paragraph, this time a little bit longer',
    		{ text: 'Third paragraph, slightly bigger font size', fontSize: 20 },
    		{ text: 'Another paragraph using a named style', style: 'header' },
    		{ text: ['playing with ', 'inlines' ] },
    		{ text: ['and ', { text: 'restyling ', bold: true }, 'them'] }
    	],
	styles: {
  		header: { fontSize: 30, bold: true }
  	}
 };
  createPdfBinary(docDefinition, function(binary) {
    res.contentType('application/pdf');
    //res.header('Content-Disposition', 'attachment; filename=' + 'report.pdf');
    res.send(binary);
  }, function(error) {
    res.send('ERROR:' + error);
  });

}

function getReport(req, res, next) {

  const pilot = req.pilot;
  const { franchise ,fromDate = moment().format('YYYYMMDD'),
    toDate = moment().format('YYYYMMDD'), timeZone = 'Europe/London' } = req.body;
  const diffInMinutes = moment().tz(timeZone).utcOffset();


  var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

  var printer = new pdfMakePrinter(fonts);

  const docDefinition = {
    info: {
      title: 'Pilot Report'
    },
    content: [
      { text: 'Season Boy', style: 'header'},
      'Franchise:' + (pilot.franchise ? pilot.franchise.name : ''),
      '\n',
       pilot.user.firstName + ' ' + pilot.user.lastName,
      'Mobile: ' + pilot.user.mobileNumber,
      '\n',
      'From date: ' +  moment(fromDate, "YYYYMMDD").format('MMMM Do YYYY') ,
      'To date: ' +  moment(toDate, "YYYYMMDD").format('MMMM Do YYYY'),
      '\n \n'
    ],
    styles: {
      header: { fontSize: 20, bold: true }
    }
  };


  Order.find()
    .where('pilot', pilot._id.toString())
    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
    .lte(moment(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
    .then(orders => {

      const orderRows = [];
      let totalDistance = 0;
      let totalTime = 0;

      for (let i=0; i < orders.length; i++) {
        const order = orders[i];

        totalDistance += order.distance_in_meters;
        totalTime += order.time_in_seconds;

        orderRows.push([
          order.id ? order.id : 'NA',
          order.status ? order.status : '' ,
          (order.distance_in_meters/1000).toFixed(2),
          (order.time_in_seconds/3600).toFixed(2)
        ]);
      }

      const ordersContent = {
        style: 'tableExample',
        table: {
          widths: [100, '*', 200, '*'],
          body: [
            ['Order id', 'Status', 'Distance (Kms)', 'Duration (Hrs)']
          ]
        }
      };

      ordersContent.table.body = ordersContent.table.body.concat(orderRows);
      docDefinition['content'].push(ordersContent);

      docDefinition['content'].push('\nTotal Kms: ' +  (totalDistance/1000).toFixed(2) + ' Kms');
      docDefinition['content'].push('\nNumber of orders: ' + orders.length);

      const dirName = 'reports/';
      const fileName = 'Pilot' + 'Report' + pilot._id.toString() + fromDate + toDate + '.pdf';

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(dirName + fileName)).on('finish', function () {
        //res.set('Content-disposition', 'attachment; filename='+ fileName);
        //res.set('Content-type', 'application/pdf');
        //res.sendFile(__dirname + '/../../../' +  dirName + fileName);
        //res.download(dirName + fileName, fileName);

        res.send({file : fileName});

      });

      pdfDoc.end();

    })
    .catch(e => next(e));
}




export default {
  load, get, create, update, list, remove, updateLocation, updateTeams,
    getUnAssignedPilotsByTeam, createPilot, getSales, getSalesByPilot, getTimesheets, getTimesheetsByPilot,
    stats, listByTeam, updateAvailability, listByManager, getActivity, getReport};
