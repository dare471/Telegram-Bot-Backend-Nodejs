const User = require('../models/user');
const bot = require('../util/telegrambot').bots;
const axios = require('axios');
const config = require('../util/config');
const checkuser = require('./checkUser');
const myTasks = require('../util/myTasks');

exports.logOut = (msg) => {
    const {id} = msg.from;
    bot.sendMessage(id, 'Подтвердите выход из приложения', {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [
                    { text: 'Выйти', callback_data: 'logout' },
                    { text: 'Отмена', callback_data: 'back' }
                ]
            ]
        }
    });
}

exports.checkLogOut = (id, data) => {
    if(data === 'logout'){
        User.getUserOnecname(id)
            .then(async([rows]) => {
                await axios.post(`${config.ONE_C_URL}logOut`, {
                    "user": {
                        "fio": rows[0].onec_name,
                        "id_telegram": id
                    }
                },{
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: config.ONE_C_AUTH_LOGIN,
                        password: config.ONE_C_AUTH_PASSWORD
                    }
                })
                    .then(() => {
                        User.deleteUser(id)
                            .then(() => {
                                bot.sendMessage(id, 'Вы вышли из приложения', {
                                    reply_markup: {
                                        remove_keyboard: true
                                    }
                                })
                            })
                            .catch(e => {
                                console.log(e.message);
                            });
                    }).catch(e => {
                        console.log(e.message);
                    });
            })
    }else{
        bot.sendMessage(id, 'Вы авторизованы')
    }

}

exports.setUser = (msg) => {
    const {id, first_name, last_name} = msg.from;
    const {text} = msg;
    User.getAllUsersBotId()
        .then(([rows]) => {
            let idArr = [];
            for(let i = 0; i<rows.length; i++){
                idArr.push(rows[i].id_telegram);
            }
            if(idArr.includes(id)){
                User.getUserOnecname(id)
                    .then(([rows]) => {
                        if(rows[0].onec_name === null && text === '/start' && rows[0].registred === 0){
                            bot.sendMessage(id, 'Введите ФИО в 1С')
                        }
                        else if(rows[0].onec_name === null && rows[0].checked === 0){
                            async function checkFrom1c(text) {
                                bot.sendMessage(id, 'Ожидайте...');
                                await axios.post(`${config.ONE_C_URL}sendCode`, {
                                    "user": {
                                        "fio": text,
                                        "id_telegram": id,
                                        "delete": false
                                    }
                                },{
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    auth: {
                                        username: config.ONE_C_AUTH_LOGIN,
                                        password: config.ONE_C_AUTH_PASSWORD
                                    }
                                })
                                    .then(res => {
                                        if(res.data.Result){
                                            User.setUserOnecname(text, id);
                                            bot.sendMessage(id, 'Проверочный код отправлен на Ваш email\nПосле получения нажмите "Подтвердить" и введите код', {
                                                reply_markup: {
                                                    resize_keyboard: true,
                                                    keyboard: [
                                                        ['Подтвердить'],
                                                        ['Запросить повторно'],
                                                        ['Ввести ФИО заново']
                                                    ]
                                                }
                                            });
                                        }else{
                                            bot.sendMessage(id, res.data.message)
                                        }

                                    }).catch(e => {
                                        console.log(e.message);
                                    });
                            }
                            checkFrom1c(text)
                        }
                        else if(rows[0].onec_name !== null && rows[0].checked === 1 && rows[0].registred === 0){
                            async function getCode(text) {
                                bot.sendMessage(id, 'Ожидайте...');
                                await axios.post(`${config.ONE_C_URL}verificationUser`, {
                                    "user": {
                                        "fio": rows[0].onec_name,
                                        "id_telegram": id,
                                        "code": `${text}`
                                    }
                                },{
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    auth: {
                                        username: config.ONE_C_AUTH_LOGIN,
                                        password: config.ONE_C_AUTH_PASSWORD
                                    }
                                })
                                    .then(res => {
                                        if(res.data.Result){
                                            User.setRegistred(id);
                                            bot.sendMessage(id, 'Вы авторизованы', {
                                                reply_markup: {
                                                    resize_keyboard: true,
                                                    keyboard: [
                                                        ['Мои задачи'],
                                                        ['Работа с клиентом'],
                                                        ['Номенклатура и остатки'],
                                                        ['Автопарк'],
                                                        ['Поставить задачу'],
                                                        ['Кадры и справки'],
                                                        ['На главную'],
                                                        ['Выйти из приложения']
                                                    ]
                                                }
                                            });
                                        }
                                        else{
                                            bot.sendMessage(id, 'Код не принят, попробуйте снова.\nИли запросите новый', {
                                                reply_markup: {
                                                    resize_keyboard: true,
                                                    keyboard: [
                                                        ['Запросить повторно'],
                                                        ['Ввести ФИО заново']
                                                    ]
                                                }
                                            })
                                        }
                                    }).catch(e => {
                                        console.log(e.message);
                                    });
                            }
                            getCode(text)
                        }
                        if(rows[0].registred === 1){
                            myTasks.setNewTask(id, [])
                            myTasks.setUserType(id, '')
                            myTasks.setAllproducts(id, '')
                            myTasks.setCounter(id, 0)
                            // bot.sendMessage(id, 'Выберите раздел в меню', {
                            //     reply_markup: {
                            //         resize_keyboard: true,
                            //         keyboard: [
                            //             ['Мои задачи'],
                            //             ['Работа с клиентом'],
                            //             ['Номенклатура и остатки'],
                            //             ['Автопарк'],
                            //             ['Поставить задачу'],
                            //             ['Кадры и справки'],
                            //             ['На главную'],
                            //             ['Выйти из приложения']
                            //         ]
                            //     }
                            // });
                        }
                        else{
                            if(rows[0].onec_name !== null && rows[0].checked === 0){
                                checkuser.getCheck(msg)
                            }else{
                                bot.sendMessage(id, 'Unknown command')
                            }
                        }
                });

            }else{
                User.newUser(id, first_name, last_name);
                bot.sendMessage(id, 'Введите ФИО в 1С')
            }
        })
};
