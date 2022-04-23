const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const Path = require('path')
const {menu, personnelandhelp} = require("../controllers/menu")
const {selectdocument, expectation, continued} = require("../controllers/getmessage")

exports.getWorkHelp = msg => {
    const {id} = msg.from;
    bot.sendMessage(id, selectdocument, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: personnelandhelp
        }
    });
}
exports.getSumReport = async msg => {
    const {id} = msg.from;
    await axios.get(`${config.ONE_C_URL}getSumReport`,
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: msg.from.id
            }
        },
    )
    .then((res) => {
        console.log(res);
        bot.sendMessage(id, res.data.message, {parse_mode: 'HTML'}, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: menu
            }
        })
    })
    .catch((e) => {
        console.log(e.message)
        bot.sendMessage(id, expectation)
    })
}

exports.getVisit = async msg => {
    const {id, first_name} = msg.from;
    console.log(msg.from)
    await axios.get(`${config.ONE_C_URL}getVisit`,
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id
            }
        },
    )
    .then((res) => {
        console.log(res);
        bot.sendMessage(id, res.data, {parse_mode: 'HTML'}, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: menu
            }
        })
    })
    .catch((e) => {
        console.log(e.message)
        bot.sendMessage(id, expectation)
    })
}

exports.getVacation = async msg => {
    const {id, first_name} = msg.from;
    console.log(msg.from)
    await axios.get(`${config.ONE_C_URL}getMyVacation`,
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id
            }
        },
    )
        .then((res) => {
            const path = Path.resolve(
                __dirname,
                '../dist/pdf',
                `Отпускные дни ${first_name}.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            console.log(res.data)
            bot.sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Отпускные дни ${first_name}.${res.headers.file_type}`))
                .then(() => {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, continued, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menu
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getWorkDoc = async msg => {
    const {id, first_name} = msg.from;
    console.log(msg.from)
    await axios.get(`${config.ONE_C_URL}getUserCertWork`,
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id
            }
        },
    )
        .then((res) => {
            const path = Path.resolve(
                __dirname,
                '../dist/pdf',
                `Справка с места работы ${first_name}.${res.headers.file_type}`,
            )
            let fs = require('fs');
            fs.writeFile('file.txt', res, function(error){
            if(error) throw error; // ошибка чтения файла, если есть
            console.log('Данные успешно записаны записать файл');
            });
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot.sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Справка с места работы ${first_name}.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/Справка с места работы ${first_name}.${res.headers.file_type}`, (err) => {
                        if (err && err.code == 'ENOENT') {
                            // file doens't exist
                            console.info("File doesn't exist, won't remove it.")
                        } else if (err) {
                            // other errors, e.g. maybe we don't have enough permission
                            console.error('Error occurred while trying to remove file')
                        } else {
                            // console.info(`removed ${res.document.file_name}`);
                        }
                    })
                }).then(() => {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, continued, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menu
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}