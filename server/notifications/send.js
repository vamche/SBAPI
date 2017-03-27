import axios from 'axios';

const sendNotification = function (data) {

  axios.defaults.baseURL = 'https://onesignal.com/api/v1';
  axios.defaults.headers.common['Authorization'] = 'Basic YmIwMGMzZTAtOGMxNi00MmZlLWJkYjUtYjBjODY2ZWNkZTNi';
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencodeapplication/json; charset=utf-8';

  return axios.post('/notifications', data)
         .then((response) => {
           console.log(response);
         })
         .catch((error) => {
           console.log(error);
         });
}

const sendSMS = function (mobiles, message, route) {
  const url = `https://control.msg91.com/api/sendhttp.php?authkey=113219ATt8BmevKtDK5742a5f9&mobiles=${mobiles}&message=${message}&sender=SSNBOY&route=${route}&country=0`;
  return axios.get(url)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}


const message = {
  app_id: "092a0af4-0df5-4e86-aebc-f42e4a8d383e",
  contents: {"en": "English Message From Node!"},
  included_segments: ["All"],
  filters :[{'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}]
};

export default { sendNotification, sendSMS, message };

