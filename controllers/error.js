const fs = require('fs');
const axios = require('axios');

exports.errorsendgroups = async er => {

    if(er.data.message){
      const text =  encodeURI(er.data.message);
        console.log(text)
        var config = {
        method: 'get',
        url: 'https://api.telegram.org/bot5090148702:AAFjzaqlFO5Pf8UMEmofBgPKIwlijXtlx8s/sendMessage?chat_id=@notificealm&&parse_mode=HTML&text=' + text,
        headers: { 
        'Authorization': 'Basic dGVsZWdyYW1ib3Q6dk8za3lneW0='
        }
      };
    }
    else{
      const text =  encodeURI(er.data);
        console.log(text)
        var config = {
        method: 'get',
        url: 'https://api.telegram.org/bot5090148702:AAFjzaqlFO5Pf8UMEmofBgPKIwlijXtlx8s/sendMessage?chat_id=@notificealm&&parse_mode=HTML&text=' + text,
        headers: { 
        'Authorization': 'Basic dGVsZWdyYW1ib3Q6dk8za3lneW0='
        }
      };
    }
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};
exports.errorsend = async er => {
  const text =  encodeURI(er);
  console.log(text)
  var config = {
    method: 'get',
    url: 'https://api.telegram.org/bot5090148702:AAFjzaqlFO5Pf8UMEmofBgPKIwlijXtlx8s/sendMessage?chat_id=@notificealm&&parse_mode=HTML&text=' + text,
    headers: { 
      'Authorization': 'Basic dGVsZWdyYW1ib3Q6dk8za3lneW0='
    }
  };
  axios(config)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
};