const axios = require('axios');
const bot = require('../util/telegrambot').bots;
const debug = require('../util/helpers');

exports.getUsers = (id) => {
    async function fromAdminPanel() {
        await axios.get('https://victor.victorshkoda_OLD.ml/api/users', {headers: {'Content-Type': 'application/json'}})
            .then(res => {
                for(let i = 0; i < res.data.length; i++){
                    bot.sendMessage(id, res.data[i].name);
                }

            }).catch(e => {
                console.log(e.message);
            });
    }
    fromAdminPanel();
};