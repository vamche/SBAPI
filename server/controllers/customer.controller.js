import Customer from '../models/customer.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import BPromise from 'bluebird';
import moment from 'moment';

import pdfMakePrinter from 'pdfmake/src/printer';
var fs = require('fs');

/**
 * Load customer and append to req.
 */
function load(req, res, next, id) {
  Customer.get(id)
    .then((customer) => {
      req.customer = customer; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get customer
 * @returns {Customer}
 */
function get(req, res) {
  return res.json(req.customer);
}

/**
 * Create new customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function create(req, res, next) {
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
      const customer = new Customer({
        user : savedUser._id,
        isMerchant : req.body.isMerchant,
        teams : req.body.teams,
        location : req.body.location,
        address : req.body.address,
        name : req.body.name,
        franchise : req.body.franchise ? req.body.franchise : null
      });
      customer.save()
        .then(savedCustomer => {
          res.json(savedCustomer);
        })
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

function createCustomer(req, res, next){

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
            const customer = new Customer({
                user : savedUser._id,
                isMerchant : req.body.isMerchant,
                teams : req.body.teams,
                location : req.body.location,
                name : req.body.name
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
  const customer = req.customer;
  customer.location = req.body.location;
  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

function updateTeams(req, res, next) {
  const customer = req.customer;
  customer.teams = req.body.teams;
  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

/**
 * Update existing customer
 * @property {string} req.body.username - The username of customer.
 * @property {string} req.body.mobileNumber - The mobileNumber of customer.
 * @returns {Customer}
 */
function update(req, res, next) {
  const customer = req.customer;




  customer.save()
    .then(savedCustomer => res.json(savedCustomer))
    .catch(e => next(e));
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Customer.list({ limit, skip })
    .then(customers => res.json(customers))
    .catch(e => next(e));
}

/**
 * Delete customer.
 * @returns {Customer}
 */
function remove(req, res, next) {
  const customer = req.customer;
  customer.remove()
    .then(deletedCustomer => res.json(deletedCustomer))
    .catch(e => next(e));
}

/**
 * Get customer list.
 * @property {number} req.query.skip - Number of Customer to be skipped.
 * @property {number} req.query.limit - Limit number of Customer to be returned.
 * @returns {Customer[]}
 */
function listOfCustomersWithUserDetails(req, res, next) {
  const { limit = 100, skip = 0 } = req.query;
  let customersWithUserIds = [];
  Customer.list({ limit, skip })
    .then((customers) => {
      // customersWithUserIds = customers;
      let updatedCustomers = [];
      customersWithUserIds = customers.map(
        (customer) => {
          let x;
          const y = User.get(customer.user)
            .then((user) => {
              x = customer;
              x.user = JSON.stringify(user);
              updatedCustomers.push(x);
              return x;
            });
          return y;
        });
      BPromise.all(customersWithUserIds)
        .then(() => res.json(updatedCustomers))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}


function getSales(req, res, next){
    const { franchise ,fromDate = moment().format('YYYYMMDD'),
      toDate = moment().format('YYYYMMDD'), timeZone = 'Europe/London' } = req.body;
    const diffInMinutes = moment().tz(timeZone).utcOffset();

    let sales = []; // Array of {_id: String, title: String, sales: String}
    let promises;
    Customer.find()
        .where('franchise', franchise)
        .then(customers => {
            promises = customers.map(customer => {
                let totalSales = 0;
                let totalDistance = 0;
                const p = Order.find()
                    .where('franchise', franchise)
                    .where('createdBy', customer._id.toString())
                    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
                      .lte(moment(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
                    .then(orders => {
                        orders.forEach(order => {
                          totalSales = totalSales + order.final_cost;
                          totalDistance = totalDistance + order.distance_in_meters;

                        });
                        sales.push({
                            '_id': customer._id,
                            'name': customer.name,
                            'sales': totalSales,
                            'distance': totalDistance
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

function getSalesByCustomer(req, res, next){
    const { fromDate = moment().format('YYYYMMDD'), toDate = moment().format('YYYYMMDD') } = req.body;
    let sales; // {_id: String, title: String, sales: String}
    Order.find()
        .where('createdBy', req.customer._id.toString())
        .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day')).lte(moment(toDate, "YYYYMMDD").endOf('day'))
        .then(orders => {
            let total = 0;
            orders.forEach(order => {
                total = total + order.final_cost;
            });
            sales = {
                '_id' : req.customer._id,
                'name' : req.customer.name,
                'sales' : total,
                'orders' : orders
            };
            res.json(sales);
        })
        .catch(e => next(e));
}


function getReportAllCustomers(res, req, next) {
  const body = req.body;
  const timeZone = body.timeZone ? body.timeZone : 'Europe/London';
  const fromDate = body.fromDate ? body.fromDate : moment().format('YYYYMMDD');
  const toDate = body.toDate ? body.toDate : moment().format('YYYYMMDD');
  const diffInMinutes = moment().tz(timeZone).utcOffset();
  const franchise = body.franchise;

  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

  const printer = new pdfMakePrinter(fonts);

  const docDefinition = {
    info: {
      title: 'Customers Sales Report'
    },
    content: [],
    styles: {
      header: { fontSize: 20, bold: true }
    }
  };

  Customer.find()
    .where('franchise', franchise)
    .populate('franchise')
    .then(customers => {

      let totalSales = 0;
      let totalDistance = 0;
      let totalOrders = 0;

      const customersSalesContent = {
        style: 'tableExample',
        table: {
          widths: ['*','*' ,'*', '*'],
          body: [
            ['Customer', 'Number of orders' ,'Distance (Kms)', 'Sales (INR)']
          ]
        }
      };

      for (let j = 0; j < customers.length; j++) {
        let customerSales = 0;
        let customerOrders = 0;
        let customerDistance = 0;
        let customerRows = [];
        const customer = customers[j];

        if (customer.franchise && docDefinition.content.length === 0) {
          docDefinition.content = [
            { text: 'Season Boy', style: 'header'},
            'Franchise:' + (customer.franchise ? customer.franchise.name : ''),
            '\n',
            '\n',
            'From date: ' +  moment(fromDate, "YYYYMMDD").format('MMMM Do YYYY') ,
            'To date: ' +  moment(toDate, "YYYYMMDD").format('MMMM Do YYYY'),
            '\n \n'
          ];
        }

        Order.find()
          .where('createdBy', customer.id)
          .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
            .lte(moment(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
          .populate({
            path: 'pilot',
            populate: { path: 'user' }})
          .populate('franchise')
          .then(orders => {
            customerRows[j] = [customer.name, '0', '0.00 Km' , '0.00']
            for (let i=0; i < orders.length; i++) {
              const order = orders[i];
              customerSales += order.final_cost;
              customerDistance += order.distance_in_meters;
              customerOrders++;
              if (i == orders.length - 1) {
                totalSales += customerSales;
                totalDistance += customerDistance;
                totalOrders += orders.length;
                customerRows[j] = [
                  customer.name,
                  customerOrders ,
                  (customerDistance/1000).toFixed(2) + 'Kms',
                  customerSales.toFixed(2)
                ];
              }
            }
          })
          .catch(e => next(e));

        if (j === customers.length - 1) {

          customersSalesContent.table.body = customersSalesContent.table.body.concat(customerRows);
          docDefinition['content'].push(customersSalesContent);

          docDefinition['content'].push('\nTotal cost: Rs ' + totalSales.toFixed());
          docDefinition['content'].push('\nTotal Kms: ' +  (totalDistance/1000).toFixed(2) + ' Kms');
          docDefinition['content'].push('\nNumber of orders: ' + totalOrders);

          const dirName = 'reports/';
          const fileName =  'CustomerSales' + 'Report' + fromDate + toDate + '.pdf';

          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          pdfDoc.pipe(fs.createWriteStream(dirName + fileName)).on('finish', function () {
            //res.set('Content-disposition', 'attachment; filename='+ fileName);
            //res.set('Content-type', 'application/pdf');
            //res.download(dirName + fileName, fileName);
            res.send({file : fileName});
          });

          pdfDoc.end();

        }
      }

    })
    .catch(e => next(e));

}


function getReport(req, res, next) {

  const customer = req.customer;
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
      title: 'Customer Report'
    },
    content: [
      { text: 'Season Boy', style: 'header'},
      'Franchise:' + (customer.franchise ? customer.franchise.name : ''),
      '\n',
      customer.name,
      'Mobile: ' + customer.user.mobileNumber,
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
    .where('createdBy', customer._id.toString())
    .where('createdAt').gte(moment(fromDate, "YYYYMMDD").startOf('day').subtract(diffInMinutes, 'minutes'))
    .populate({
      path: 'pilot',
      populate: { path: 'user' }})
    .lte(moment(toDate, "YYYYMMDD").endOf('day').subtract(diffInMinutes, 'minutes'))
    .then(orders => {

      const orderRows = [];
      let totalDistance = 0;
      let totalCost = 0;

      for (let i=0; i < orders.length; i++) {
        const order = orders[i];

        totalDistance += order.distance_picked_to_delivery_in_meters;
        totalCost += order.final_cost;

        orderRows.push([
          order.id ? order.id : 'NA',
          order.paymentType ? order.paymentType : 'NA' ,
          order.pilot ? order.pilot.user.firstName + ' ( ' + order.pilot.user.mobileNumber + ' )' : 'NA',
          (order.distance_picked_to_delivery_in_meters/1000).toFixed(2) + ' Kms',
          (order.final_cost).toFixed(2)
        ]);
      }

      const ordersContent = {
        style: 'tableExample',
        table: {
          widths: [100, 75 , 100 ,'*', '*'],
          body: [
            ['Order id', 'Payment Type', 'Pilot' ,'Distance (Kms)', 'Cost (INR)']
          ]
        }
      };

      ordersContent.table.body = ordersContent.table.body.concat(orderRows);
      docDefinition['content'].push(ordersContent);

      docDefinition['content'].push('\nTotal cost: Rs ' + totalCost.toFixed());
      docDefinition['content'].push('\nTotal Kms: ' +  (totalDistance/1000).toFixed(2) + ' Kms');
      docDefinition['content'].push('\nNumber of orders: ' + orders.length);

      const dirName = 'reports/';
      const fileName =  'Customer' + 'Report' + customer._id.toString() + fromDate + toDate + '.pdf';

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(dirName + fileName)).on('finish', function () {
        //res.set('Content-disposition', 'attachment; filename='+ fileName);
        //res.set('Content-type', 'application/pdf');
        //res.download(dirName + fileName, fileName);
        res.send({file : fileName});
      });

      pdfDoc.end();

    })
    .catch(e => next(e));
}

export default {
  load, get, create, update, list, remove, listOfCustomersWithUserDetails, getReportAllCustomers,
    updateLocation, updateTeams, createCustomer, getSales, getSalesByCustomer, getReport };
