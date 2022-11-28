const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const Path = require('path');
const error = require('../controllers/error');
const {menu,personnelandhelp, returntickets} = require("../controllers/menu")
const { selectdocument,expectation,continued} = require("../controllers/getmessage");
const { getDefaultSettings } = require('http2');

exports.getWorkHelp = msg => {
    const {id} = msg.from;
    bot.sendMessage(id, selectdocument, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: personnelandhelp
        }
    });
}
exports.setGetMoneyWorker = msg =>{
    const { id } = msg.from;
    console.log("SetDate" + id)
    bot.on("polling_error", console.log);
    myTasks.setUserType(id, 'GetYearsWorker')
    bot.sendMessage(id, `Отправьте дату получение аванса в формате "ггггммдд"`, {
        reply_markup: {
            resize_keyboard: true
        }
    })
}
exports.setMoney = msg =>{
    bot.on("polling_error", console.log);
    const { id } = msg.from;
    const { text } = msg;
    var date = new Date();
    let date_y = date.getFullYear();
    let date_m = date.getMonth();
    let date_d = date.getDate()
    if(date_m.toString().length<2){
       var mounth = '0' + date_m.toString()
    }else{
       var mounth = date_m;
    }
    if(date_d.toString().length<2){
        var day = '0' + date_d.toString()
     }else{
        var day = date_d;
     }
    date_tickets = date_y+''+mounth+''+day;
    console.log(date_tickets + 'U?');
    console.log(date + '?')
    console.log(text.substring(0, 8) + '?')
    console.log(text.length)
    let year = text.substring(0, 4)
    let mouth = text.substring(4, 6)
    let days = text.substring(6, 8)
    if(text.length<8){
        myTasks.setUserType(id, '')
        bot.sendMessage(id, 'Вы ввели не правильный формат даты, получение аванса исправьте дату !! (Пример: <b>'+date_tickets+'</b> -> год - <b>'+date_y+'</b>, Месяц - <b>'+date_m+'</b>, День - <b>'+day+'</b>). Вы ввели: <b>Год - '+ year +', Месяц - '+mouth+', Дни - '+days+'</b> ', {parse_mode: 'HTML'}, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: returntickets
            }
        })   
    }
    if (date_tickets < text.substring(0, 8)){
        myTasks.setGetMoneyWorker(id, text.substring(0, 8))
        myTasks.setUserType(id, 'GetMoneyWorker')
        bot.sendMessage(id, `Отправьте сумму Аванса`, {
            reply_markup: {
                resize_keyboard: true,
            }
        })
    }
    else{
        myTasks.setUserType(id, '')
        bot.sendMessage(id, 'Вы ввели не правильный формат даты, указали дату задним числом исправьте дату !! (Пример: <b>'+date_tickets+'</b> -> год - <b>'+date_y+'</b>, Месяц - <b>'+date_m+'</b>, День - <b>'+day+'</b>). Вы ввели: <b>Год - '+ year +', Месяц - '+mouth+', Дни - '+days+'</b> ', {parse_mode: 'HTML'}, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: returntickets
            }
        })
    }
   
}

exports.setComment = msg =>{
    const { id } = msg.from;
    const { text } = msg
    myTasks.setGetSumMoneyWorker(id, text)
    myTasks.setUserType(id, '');
    myTasks.setUserType(id, 'GetCommentworker');
    bot.sendMessage(id, `Отправьте комментарий к авансу`, {
        reply_markup: {
            resize_keyboard: false,
        }
    })
}

exports.sendGetMoney = async msg =>{
    const { id } = msg.from;
    const { text } = msg;
    myTasks.setGetCommentMoneyWorker(id, text)
    const command = `?command=setGetMoneyWorker&id_telegram=`+msg.from.id
    await axios.post(`${config.ONE_C_URL + command}`,{  "date": myTasks.getMoneyWorker()[id.toString()],
    "sum": myTasks.getGetSumMoneyWorker()[id.toString()],
    "desc": myTasks.getGetCommentMoneyWorker()[id.toString()]  
    },
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
    )
    .then((res) => {
        bot.sendMessage(id, res.data.message, {parse_mode: 'HTML'}, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: menu
            }
        })
        myTasks.setUserType(id, '')
        myTasks.setGetMoneyWorker(id, '')
        myTasks.setGetSumMoneyWorker(id, '')
        myTasks.getGetCommentMoneyWorker(id, '')
    })
    .catch((e) => {
        console.log(e.message)
        bot.sendMessage(id, expectation)
    })
}

exports.getSumReport = async msg => {
    const {id} = msg.from;
    console.log(msg.from.id)
    const command = `?command=getSumReport&id_telegram=`+msg.from.id
    console.log(config.ONE_C_URL + command)
    await axios.post(`${config.ONE_C_URL + command}`,{},
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
    )
    .then((res) => {
        console.log(res)
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
    const command = `?command=getVisit&id_telegram=`+msg.from.id
    console.log(msg.from)
    console.log(config.ONE_C_URL + command)
    await axios.post(`${config.ONE_C_URL + command}`, {},
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
    )
    .then((res) => {
        console.log(res)
        bot.sendMessage(id, res.data.info, {parse_mode: 'HTML'}, {
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
    const command = `?command=getMyVacation&id_telegram=`+msg.from.id
    await axios.post(`${config.ONE_C_URL + command}`, {},
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
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
    const command = `?command=getUserCertWork&id_telegram=`+msg.from.id
    await axios.post(`${config.ONE_C_URL + command}`, {},
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
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