const User = require('../models/user');
const bot = require('../util/telegrambot').bots;
const axios = require('axios');
const config = require('../util/config');
const {checkuser} = require('../controllers/menu');
const { expectation,entercode,entername,alertcode,errordata } = require('./getmessage');

exports.getCheck = (msg) => {
    const {id} = msg.from;
    User.setUserChecked(id, 1);
    bot.sendMessage(id, entercode, {
        reply_markup: {
            remove_keyboard: true
        }
    })
};
exports.deleteFio = (msg) => {
    const {id} = msg.from;
    User.setUserOnecnameNull(id).then(() => {
        bot.sendMessage(id, entername, {
            reply_markup: {
                remove_keyboard: true
            }
        })
        console.log(msg.from);
    });
};
exports.anotherCode = (msg) => {
    const {id} = msg.from;
    console.log(id)
    User.getUserOnecname(id)
        .then(([rows]) => {
            async function checkFrom1c() {
                bot.sendMessage(id, expectation);
                let command = `?command=sendCode&id_telegram=` + id
                await axios.post(`${config.ONE_C_URL + command}`, {
                        "fio": rows[0].onec_name                   
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: 'telegrambot',
                        password: 'Aa123456'
                    }
                })
                    .then(res => {
                        if (res.data.Result) {
                            bot.sendMessage(id, alertcode, {
                                reply_markup: {
                                    resize_keyboard: true,
                                    keyboard: checkuser
                                }
                            });
                        } else {
                            bot.sendMessage(id, errordata)
                        }

                    }).catch(e => {
                        console.log(e.message);
                    });
            }
            checkFrom1c()
        })
        .catch(e => {
            console.log(e.message);
        });
};