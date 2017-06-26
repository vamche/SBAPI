import axios from 'axios';

const sendNotification = function (data) {

  axios.defaults.baseURL = 'https://onesignal.com/api/v1';
  axios.defaults.headers.common['Authorization'] = 'Basic YmIwMGMzZTAtOGMxNi00MmZlLWJkYjUtYjBjODY2ZWNkZTNi';
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencodeapplication/json; charset=utf-8';

  return axios.post('/notifications', data)
         .then((response) => {
           console.log('Succecss Sending Notification!');
         })
         .catch((error) => {
           console.log(error);
         });
}

const sendSMS = function (mobiles, message, route) {
  const url = `https://control.msg91.com/api/sendhttp.php?authkey=113219ATt8BmevKtDK5742a5f9&mobiles=${mobiles}&message=${message}&sender=SSNBOY&route=${route}&country=0`;
  return axios.get(url)
    .then((response) => {
      console.log('Succecss Sending SMS!');
    })
    .catch((error) => {
      console.log(error);
    });
}

const pushNotificationTemplateId = '1ce3c15d-9821-4dee-840e-2e720044020d';

const message = {
  app_id: "092a0af4-0df5-4e86-aebc-f42e4a8d383e",
  headings: {'en': 'Title'},
  contents: {"en": "English Content From Node, Yo!"},
  included_segments: ["All"],
  filters :[{'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}],
  template_id : '1ce3c15d-9821-4dee-840e-2e720044020d'
};


export default { sendNotification, sendSMS, message };

