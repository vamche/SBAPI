'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sendNotification = function sendNotification(data) {

  _axios2.default.defaults.baseURL = 'https://onesignal.com/api/v1';
  _axios2.default.defaults.headers.common['Authorization'] = 'Basic YmIwMGMzZTAtOGMxNi00MmZlLWJkYjUtYjBjODY2ZWNkZTNi';
  _axios2.default.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencodeapplication/json; charset=utf-8';

  return _axios2.default.post('/notifications', data).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
};

var sendSMS = function sendSMS(mobiles, message, route) {
  var url = 'https://control.msg91.com/api/sendhttp.php?authkey=113219ATt8BmevKtDK5742a5f9&mobiles=' + mobiles + '&message=' + message + '&sender=SSNBOY&route=' + route + '&country=0';
  return _axios2.default.get(url).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
};

var message = {
  app_id: "092a0af4-0df5-4e86-aebc-f42e4a8d383e",
  contents: { "en": "English Message From Node!" },
  included_segments: ["All"],
  filters: [{ 'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN' }]
};

exports.default = { sendNotification: sendNotification, sendSMS: sendSMS, message: message };
module.exports = exports['default'];
//# sourceMappingURL=send.js.map
