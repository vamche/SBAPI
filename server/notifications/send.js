import axios from 'axios';

function sendNotification(data) {

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

const message = {
  app_id: "092a0af4-0df5-4e86-aebc-f42e4a8d383e",
  contents: {"en": "English Message From Node!"},
  included_segments: ["All"],
  filters :[{'field': 'tag', 'key': 'manager', 'relation': '=', 'value': 'ADMIN'}]
};

export default { sendNotification, message };

