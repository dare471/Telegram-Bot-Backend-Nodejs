const bot = require('../util/telegrambot').bots;
const addNewTask = require('../controllers/addNewTask');
const fs = require('fs')
const path = require('path');
const exec = require('child_process').exec;
const User = require('../models/user');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks')
const menu = require('../controllers/menu')

exports.getFiles = (msg, fileid) => {
    const { id } = msg.from;
    bot.getFile(fileid).then(obj => {
        bot.downloadFile(obj.file_id, './dist/uploads').then(file => {
            let filename = +new Date() + '_' + id.toString();
            let filepath = path.join(__dirname, '../dist/uploads/' + file.split('/')[2])
            let filedim = file.split('/')[2].split('.')[1]
            let newfilepath = path.join(__dirname, '../dist/uploads/' + filename + '.' + filedim)
            let newfilepath2 = path.join(__dirname, '../dist/uploads/' + filename + '.mp3')
            fs.rename(filepath, newfilepath, () => {
                if (filedim === 'oga') {
                    let dir = exec(`ffmpeg -i ${newfilepath} -c:a libmp3lame -q:a 2 ${newfilepath2}`, function (err, stdout, stderr) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    dir.on('exit', function (code) {
                        fs.unlink(`dist/uploads/${filename}.oga`, (err) => {
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
                    });
                    filedim = 'mp3'
                }
                addNewTask.setDate(id, filename + '.' + filedim)
            })

        })
    })
}
exports.FileSendsForAuto = (msg) => {

    const { id } = msg.from;
    const filepath = []
    User.ListFileUser(id).then(([row]) => {
        for (var i = 0; i < row.length; i++) {
            filepath.push(row[i].file_name)
        }
        // console.log(global.FileData)
        console.log(myTasks.getFileData())
        let prefics = myTasks.getFileData()[id].prefics
        let nameobject = myTasks.getFileData()[id].ИмяОбъекта
        let guid = myTasks.getFileData()[id].GUID
        let params = {
            "id_telegram": id,
            "odometr": number,
            "guid": guid,
            "files": filepath
        }
        axios.post(`${config.ONE_C_URL}setOdometerAuto`, params,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: config.ONE_C_AUTH_LOGIN,
                    password: config.ONE_C_AUTH_PASSWORD,
                }
            }
        ).then((res) => {
            console.log(res)
            bot.sendMessage(id, res.data.message + ' Показания зафиксированы, 👍 Фотографии прикреплены ✅', {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        ['На главную']
                    ]
                }
            });
            User.ListTruncate(id);
        }).catch(error => {
            console.log(error.response)
        });
    })
};
exports.FileSends = (msg) => {

    const { id } = msg.from;
    const filepath = []
    User.ListFileUser(id).then(([row]) => {
        for (var i = 0; i < row.length; i++) {
            filepath.push(row[i].file_name)
        }
        // console.log(global.FileData)
        console.log(myTasks.getFileData())
        let prefics = myTasks.getFileData()[id].prefics
        let nameobject = myTasks.getFileData()[id].ИмяОбъекта
        let guid = myTasks.getFileData()[id].GUID
        let params = {
            "id_telegram": id,
            "prefics": prefics,
            "nameObject": nameobject,
            "guid": guid,
            "files": filepath
        }
        axios.post(`${config.ONE_C_URL}putFilesByGuid`, params,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: config.ONE_C_AUTH_LOGIN,
                    password: config.ONE_C_AUTH_PASSWORD,
                }
            }
        ).then((res) => {
            console.log(res)
            bot.sendMessage(id, res.data.message + ' 👍 Фотографии прикреплены ✅', {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        ['На главную']
                    ]
                }
            });
            User.ListTruncate(id);
        }).catch(error => {
            console.log(error.response)
        });
    })
}

exports.acceptfiles = (msg) => {
    console.log(msg)
    let { id } = msg.from

    let filearr = []

    User.ListFileUser(id).then(([row]) => {
        for (var i = 0; i < row.length; i++) {
            filearr.push(row[i].file_name)
        }
        let odometr = myTasks.getOdometrStr()[id].odometr
        let params = {
            "id_telegram": id,
            "odometr": odometr,
            "guid_auto": myTasks.getOdometrStr()[id].guid_auto,
            "files": filearr
        }
        axios.post(`${config.ONE_C_URL}setDocOdometer`, params,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: config.ONE_C_AUTH_LOGIN,
                    password: config.ONE_C_AUTH_PASSWORD,
                }
            }
        ).then((res) => {
            User.ListTruncate(id);
            return
            
        }).catch(error => {
            console.log(error.response)
        });
    })
};
