'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendNotification(data) {

  _axios2.default.defaults.baseURL = 'https://onesignal.com/api/v1';
  _axios2.default.defaults.headers.common['Authorization'] = 'Basic YmIwMGMzZTAtOGMxNi00MmZlLWJkYjUtYjBjODY2ZWNkZTNi';
  _axios2.default.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencodeapplication/json; charset=utf-8';

  _axios2.default.post('/notifications', data).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
}

var message = {
  app_id: "092a0af4-0df5-4e86-aebc-f42e4a8d383e",
  contents: { "en": "English Message From Node!" },
  included_segments: ["All"]
};

exports.default = { sendNotification: sendNotification, message: message };
module.exports = exports['default'];
//# sourceMappingURL=send.js.map
