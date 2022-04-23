const NewTask = require('../models/newTaskModel');
const bot = require('../util/telegrambot').bots;
const myTasks = require('../util/myTasks');
const axios = require('axios');
const config = require('../util/config');
const fs = require('fs');
const {menu} = require("../controllers/menu");
const { textmust, choseartist, themtask, descriptask, chosefile,deadltask,inputdate,sendapplication,send,cancel,errordate,sendtask,uauth } = require('./getmessage');

exports.selectType = (msg) => {
    const {id} = msg.from;
    myTasks.setNewTask(id, [])
    myTasks.setUserType(id, 'first')
    bot.sendMessage(id, selectartisttype, {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [
                    {text: 'Роль', callback_data: 'newrole'},
                    {text: 'ФИО', callback_data: 'newfio'}
                ]
            ]
        }
    });
}
exports.selectedRole = (id) => {
    myTasks.setUserType(id, 'role')
    bot.sendMessage(id, entergroupname, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.selectedDocument = (guid) => {
    myTasks.setUserType(id, 'role')
    
    bot.sendMessage(id, selectartisttype, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.selectedName = (id) => {
    myTasks.setUserType(id, 'fio')
    bot.sendMessage(id, enterallartist, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.findRole = (msg) => {
    const {id} = msg.from;
    const text = msg.text;
    if (text.length > 2) {
        NewTask.getRolesByNane(text)
            .then(([rows]) => {
                if (rows.length > 0) {
                    let btns = []
                    for (let i = 0; i < rows.length; i++) {
                        btns.push([{text: rows[i].showing, callback_data: 'role|' + rows[i].guid}])
                    }
                    myTasks.setUserType(id, 'selected')
                    bot.sendMessage(id, chosegroup, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: btns
                        }
                    })
                } else {
                    bot.sendMessage(id, notfound)
                }
            })
            .catch(e => {
                console.log(e.message);
            });
    } else {
        bot.sendMessage(id, textmust)
    }

}
exports.findName = (msg) => {
    const {id} = msg.from;
    const text = msg.text;
    if (text.length > 2) {
        NewTask.getOnecusersByNane(text)
            .then(([rows]) => {
                if (rows.length > 0) {
                    let btns = []
                    for (let i = 0; i < rows.length; i++) {
                        btns.push([{text: rows[i].showing, callback_data: 'fio|' + rows[i].guid}])
                    }
                    myTasks.setUserType(id, 'selected')
                    bot.sendMessage(id, choseartist, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: btns
                        }
                    })
                } else {
                    bot.sendMessage(id, notfound)
                }
            })
            .catch(e => {
                console.log(e.message);
            });
    } else {
        bot.sendMessage(id, textmust)
    }
}
exports.getTaskMessage = (id, guid) => {
    myTasks.setNewTask(id, [guid])
    myTasks.setUserType(id, 'gettheme')
    bot.sendMessage(id, themtask)
}
exports.getDescription = (msg) => {
    const {id} = msg.from;
    let ntxt = myTasks.getNewTask()[`${id}`]
    const theme = msg.text;
    ntxt.push(theme)
    myTasks.setNewTask(id, ntxt)
    myTasks.setUserType(id, 'getdescription')
    bot.sendMessage(id, descriptask)
}
exports.getFile = (msg) => {
    const {id} = msg.from;
    const text = msg.text;
    let nt = myTasks.getNewTask()[`${id}`]
    nt.push(text)
    myTasks.setNewTask(id, nt)
    myTasks.setUserType(id, 'nextstep')
    bot.sendMessage(id, chosefile, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                ['Далее']
            ]
        }
    })
}
exports.setDate = (id, path) => {
    myTasks.setUserType(id, 'setdate')
    let ntxt = myTasks.getNewTask()[`${id}`]
    ntxt.push(path)
    bot.sendMessage(id, deadltask, {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [{text: 'В течение часа', callback_data: 'setdate|1h'}],
                [{text: 'В течение 4-х часов', callback_data: 'setdate|4h'}],
                [{text: 'В течение дня', callback_data: 'setdate|1d'}],
                [{text: 'В течение 3-х дней', callback_data: 'setdate|3d'}],
                [{text: 'В течение недели', callback_data: 'setdate|7d'}],
                [{text: 'В течение месяца', callback_data: 'setdate|30d'}]
            ]
        }
    })
        .then(() => {
            bot.sendMessage(id, 'Или нажмите "К сроку" и введите дату в формате "hh.dd.mm.yyyy" - "час, день, месяц, год" (пример: 18.20.08.2020)', {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        ['К сроку']
                    ]
                }
            })
        })
}
exports.customDate = (id) => {
    myTasks.setUserType(id, 'newcustomdate')
    bot.sendMessage(id, inputdate, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.getCustomDate = (msg) => {
    const {id} = msg.from;
    let sendeddate = msg.text.split('.')
    if(sendeddate.length === 4){
        if(sendeddate[0].length === 2 && parseInt(sendeddate[0]) < 24 && sendeddate[1].length === 2 && parseInt(sendeddate[1]) < 31  && sendeddate[2].length === 2 && parseInt(sendeddate[2]) < 13 && sendeddate[3].length === 4 && parseInt(sendeddate[3]) > 2019){
            let nowdate = +new Date(`${sendeddate[3]}-${sendeddate[2]}-${sendeddate[1]}T${sendeddate[0]}:00:00`);
            let newdate = new Date(nowdate + (60 * 60 * 1000 * 6))
            const dateTimeFormat = new Intl.DateTimeFormat('ru', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: 'numeric',
                hour12: false,
                timeZone: 'UTC'
            })
            let [{value: month}, , {value: day}, , {value: year}, , {value: hour}, , {value: minute}] = dateTimeFormat.formatToParts(newdate)
            let sendtime = `${year}${month}${day}${hour}${minute}00`;
            let nt = myTasks.getNewTask()[`${id}`]
            nt.push(sendtime)
            myTasks.setNewTask(id, nt)
            myTasks.setUserType(id, 'isshure')
            bot.sendMessage(id, sendapplication, {
                reply_markup: {
                    remove_keyboard: true
                }
            }).then(() => {
                bot.sendMessage(id, 'Выбрать', {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: send, callback_data: 'createtask'}, {text: cancel, callback_data: 'notcreatetask'}]
                        ]
                    }
                })
            })
        }else{
            bot.sendMessage(id, errordate)
        }
    }else{
        bot.sendMessage(id, errordate)
    }
}
exports.isShure = (id, date) => {
    let addtime = 0
    if (date === '1h') {
        addtime = (60 * 60 * 1000)
    } else if (date === '4h') {
        addtime = (4 * 60 * 60 * 1000)
    } else if (date === '1d') {
        addtime = (24 * 60 * 60 * 1000)
    } else if (date === '3d') {
        addtime = (3 * 24 * 60 * 60 * 1000)
    } else if (date === '7d') {
        addtime = (7 * 24 * 60 * 60 * 1000)
    } else if (date === '30d') {
        addtime = (30 * 24 * 60 * 60 * 1000)
    } else {
        addtime = 0
    }
    let nowdate = +new Date();
    let newdate = new Date(nowdate + addtime + (60 * 60 * 1000 * 6))
    const dateTimeFormat = new Intl.DateTimeFormat('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    })
    let [{value: month}, , {value: day}, , {value: year}, , {value: hour}, , {value: minute}] = dateTimeFormat.formatToParts(newdate)
    let sendtime = `${year}${month}${day}${hour}${minute}00`;
    let nt = myTasks.getNewTask()[`${id}`]
    nt.push(sendtime)
    myTasks.setNewTask(id, nt)
    myTasks.setUserType(id, 'isshure')
    bot.sendMessage(id, sendapplication, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [send],
                [cancel]
            ]
        }
    })
}

exports.sendNewTask = (chat) => {
    const {id} = chat
    let newtask = myTasks.getNewTask()[`${id}`]
    let guid = newtask[0].split('|')[1]
    let type = newtask[0].split('|')[0]
    let fileurl = null
    if(newtask[3]){
        fileurl = newtask[3];
    }
    let task = {}
    if (type === 'role') {
        NewTask.getRoleByGuid(guid)
            .then(([rows]) => {
                task = {
                    "user": {
                        "id_telegram": id
                    },
                    "executor": {
                        "Представление": rows[0].showing,
                        "GUID": guid,
                        "ИмяОбъекта": rows[0].objectname,
                        "ТипОбъекта": rows[0].objecttype,
                        "prefics": rows[0].prefics
                    },
                    "name": newtask[1],
                    "description": newtask[2],
                    "file": fileurl,
                    "time": newtask[4]
                }
                bot.sendMessage(id, expectation)
                send()
            })
    }else{
        NewTask.getUserByGuid(guid)
            .then(([rows]) => {
                task = {
                    "user": {
                        "id_telegram": id
                    },
                    "executor": {
                        "Представление": rows[0].showing,
                        "GUID": guid,
                        "ИмяОбъекта": rows[0].objectname,
                        "ТипОбъекта": rows[0].objecttype,
                        "prefics": rows[0].prefics
                    },
                    "name": newtask[1],
                    "description": newtask[2],
                    "file": fileurl,
                    "time": newtask[4]
                }
                bot.sendMessage(id, expectation)
                send()
            })
    }
    const send = async() => {
        await axios.post(`${config.ONE_C_URL}setNewTask`, {
            task
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
                myTasks.setUserType(id, '')
                myTasks.setNewTask(id, [])
                fs.unlink(`dist/uploads/${fileurl}`, err => {
                    if(err && err.code == 'ENOENT') {
                        // file doens't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error("Error occurred while trying to remove file");
                    } else {
                        // console.info(`removed ${res.document.file_name}`);
                    }
                });
                bot.sendMessage(id, sendtask, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menu
                    }
                });
            }).catch(e => {
                console.log(e.message);
            });
    }
}
exports.notSendNewTask = (id) => {
    myTasks.setNewTask(id, [])
    myTasks.setUserType(id, '')
    bot.sendMessage(id, uauth, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: menu
        }
    });
}