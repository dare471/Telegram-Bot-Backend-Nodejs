const bot = require('../util/telegrambot').bots;
const User = require('../models/user');
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const stripHtml = require("string-strip-html");
const path = require('path');
const exec = require('child_process').exec;
const { namefile, sendphoto, clientmenu } = require('../controllers/menu');
const { expectation, continued, choseclient, notdata, choseorder, chosereal, alertclientname, alertsymbols, chosefile, alertdogclient, mustsymbols, enternumberreal } = require('../controllers/getmessage')

exports.findClientByName = (msg) => {
    const { id } = msg.from;
    myTasks.setUserType(id, 'clientname')
    bot.sendMessage(id, alertclientname, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

exports.getClientByName = async (msg) => {
    const name = msg.text
    const { id } = msg.from;
    if (name.length < 5) {
        bot.sendMessage(id, alertsymbols)
    } else {
        myTasks.setUserType(id, 'getClientByName')
        let command = `?command=getClientByName&id_telegram=` + id
        await axios.post(`${config.ONE_C_URL + command}`, {
            name: name
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: config.ONE_C_AUTH_LOGIN,
                    password: config.ONE_C_AUTH_PASSWORD,
                }
            },
        )
            .then((res) => {
                let clients = res.data.Clients
                if (Array.isArray(clients) && clients.length > 0) {
                    let btns = []
                    for (let i = 0; i < clients.length; i++) {
                        btns.push([{ text: clients[i].Представление, callback_data: clients[i].guid }])
                    }
                    bot.sendMessage(id, choseclient, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: btns
                        }
                    })
                } else {
                    myTasks.setUserType(id, '')
                    bot.sendMessage(id, notdata, {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: clientmenu
                        }
                    });
                }
            })
            .catch((e) => {
                console.log(e.message)
                bot.sendMessage(id, expectation)
            })
    }

}
exports.autoFiles = (msg) => {
    console.log(`download`)
    const { id } = msg.from;
 
    if (msg.photo) {
        if (msg.photo[0]) {
            fileid = msg.photo[0].file_id;
        }
        else if (msg.photo[1]) {
            fileid = msg.photo[1].file_id;
        }
        else {
            fileid = msg.photo[2].file_id;
        }
    }
    bot.downloadFile(fileid, './dist/uploads').then(file => {
        let filename = +new Date() + '_AUTO_' + id.toString();
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
            User.FileUser(id, filename + '.' + filedim)
            
            bot.sendMessage(id, `Файлы загружены`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [['Прикрепить показатели']]
                }
            })
            myTasks.setUserType(id, `acceptfiles`)
        })
    })
}

exports.putFile = (msg) => {
    console.log(msg)
    const { id } = msg.from;
    myTasks.setUserType(id, 'putfile')
    bot.sendMessage(id, chosefile, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

exports.putFiles = (msg) => {
    const pid = msg.id
    myTasks.setUserType(pid, 'putfile')
    console.log(pid)
    bot.sendMessage(pid, chosefile, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.putFilesByGuid = (msg, fileid) => {
    const { id } = msg.from;
    console.log(fileid)
    bot.getFile(fileid).then(obj => {
        bot.downloadFile(obj.file_id, './dist/uploads').then(file => {
            let filename = +new Date() + '_' + id.toString();
            let filepath = path.join(__dirname, '../dist/uploads/' + file.split('/')[2])
            let filedim = file.split('/')[2].split('.')[1]
            let filenamee = filename + '.' + filedim;
            let newfilepath = path.join(__dirname, '../dist/uploads/' + filename + '.' + filedim)
            let newfilepath2 = path.join(__dirname, '../dist/uploads/' + filename + '.mp3')
            User.FileUser(id, filenamee)
            console.log(id, newfilepath)
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
                bot.sendMessage(id, 'Файл полностью загружен', {
                    reply_markup: {
                        remove_keyboard: true,
                        keyboard: namefile
                    }
                })
            })

        })
    })
};
exports.findContractByNumber = (msg) => {
    const { id } = msg.from;
    myTasks.setUserType(id, 'contractname')
    bot.sendMessage(id, alertdogclient, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

exports.getContractByNumber = async (msg) => {
    const number = msg.text
    const { id } = msg.from;
    if (number.length < 5) {
        bot.sendMessage(id, mustsymbols)
    } else {
        myTasks.setUserType(id, 'getContractByNumber')
        await axios.get(`${config.ONE_C_URL}getContractByNumber`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: config.ONE_C_AUTH_LOGIN,
                    password: config.ONE_C_AUTH_PASSWORD,
                },
                params: {
                    id_telegram: id,
                    number: number
                }
            },
        )
            .then((res) => {
                let contracts = res.data.Contracts
                if (contracts.length > 0) {
                    let selectcontracts = []
                    for (let i = 0; i < contracts.length; i++) {
                        selectcontracts.push([{
                            text: contracts[i].Представление,
                            callback_data: 'contract|' + contracts[i].GUID
                        }])
                    }
                    bot.sendMessage(id, choseorder, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: selectcontracts
                        }
                    })
                } else {
                    myTasks.setUserType(id, '')
                    bot.sendMessage(id, notdata, {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: clientmenu
                        }
                    });
                }
            })
            .catch((e) => {
                console.log(e.message)
                bot.sendMessage(id, expectation)
            })
    }
}
exports.findSellingByNumber = (msg) => {
    bot.on("polling_error", console.log);
    const { id } = msg.from;
    myTasks.setUserType(id, 'sellingtname')
    bot.sendMessage(id, enternumberreal, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.getSellingByNumber = async (msg) => {
    const { id } = msg.from;
    const number = msg.text
    await axios.get(`${config.ONE_C_URL}getSellingByNumber`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id,
                number: number
            }
        },
    )
        .then((res) => {
            myTasks.setUserType(id, 'sell')
            let sell = res.data.Selling
            let btns = []
            if (sell.length > 0) {
                for (let i = 0; i < sell.length; i++) {
                    btns.push([{ text: sell[i].Представление, callback_data: sell[i].GUID }])
                }
                bot.sendMessage(id, chosereal, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: clientmenu
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
const Path = require('path');
exports.getFile = async (msg) => {
    const { id } = msg.from;
    let clientdata = myTasks.getClientData()[id]
    let guid = myTasks.getClientData()[id].guid
    await axios.get(`${config.ONE_C_URL}get_file`,
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id,
                prefics: clientdata.prefics,
                nameObject: clientdata.nameObject,
                guid: clientdata.guid
            }
        },
    )
        .then((res) => {
            const path = Path.resolve(
                __dirname,
                '../dist/pdf',
                `a${guid}a.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/a${guid}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/a${guid}a.${res.headers.file_type}`, (err) => {
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
                })
            bot.sendMessage(id, continued, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: clientmenu
                }
            });
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}