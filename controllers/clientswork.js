const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const stripHtml = require("string-strip-html");
const Path = require('path')
const {clientmenu,findclient,getclientguid,getcontract,getselling} = require('../controllers/menu');
const {expectation,continued,сhoosesearch,choseaction,enterbin,choseclient,choseseason,notdata,choseorder,chosereal} = require('../controllers/getmessage')

exports.startClientWork = (msg) => {
    const {id} = msg.from;
    bot.sendMessage(id, choseaction, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: clientmenu
        }
    });
}
exports.findClient = (msg) => {
    const {id} = msg.from;
    myTasks.setUserType(id, '')
    bot.sendMessage(id, сhoosesearch, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: findclient
        }
    });
}
exports.findClientByBin = (msg) => {
    const {id} = msg.from;
    myTasks.setUserType(id, 'bin')
    bot.sendMessage(id, enterbin, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.getClientByBin = async (msg) => {
    const bin = msg.text
    const {id} = msg.from;
    let command = `?command=getClientByBIN&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
        bin: bin
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
            console.log(res)
            let btns = []
            for (let i = 0; i < res.data.Clients.length; i++) {
                btns.push([{text: res.data.Clients[i].Представление, callback_data: res.data.Clients[i].guid}])
            }
            myTasks.setUserType(id, `selectedclient`)
            bot.sendMessage(id, choseclient, {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: btns
                }
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getClientByGuid = async (id, guid) => {
    let command = `?command=getClientByGuid&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,{
        guid: guid
    },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            
        },
    )
        .then((res) => {
            myTasks.setUserType(id, guid)
            let name = res.data.Представление
            let message = stripHtml(res.data.description);
            message = message.replace(/[<>]/ig, "'");
            let html = `
<b>${name}</b>
<pre>${message}</pre>
   `;
            bot.sendMessage(id, html, {
                parse_mode: "HTML",
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: getclientguid
                }
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getContractByClient = async (msg, type) => {
    if (type === 0) {
        const {id} = msg.from;
        let guid = myTasks.getUserType()[id]
        let command = `?command=getContractByClient&id_telegram=` + id
        await axios.post(`${config.ONE_C_URL + command}`,{
            guid: guid
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
                let contracts = res.data.Contracts
                myTasks.setClientData(id, contracts)
                let sezons = []
                let btns = []
                if (contracts.length > 0) {
                    for (let i = 0; i < contracts.length; i++) {
                        if (sezons.includes(contracts[i].sezon)) {
                            continue
                        }
                        sezons.push(contracts[i].sezon)
                        btns.push([{text: contracts[i].sezon, callback_data: 'seazons|' + contracts[i].sezon}])
                    }
                    bot.sendMessage(id, choseseason, {
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
    } else {
        let arr = myTasks.getClientData()[msg.split('|')[1]]
        let selectseazon = msg.split('|')[0]
        let selectcontracts = []
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].sezon === selectseazon) {
                selectcontracts.push([{text: arr[i].Представление, callback_data: 'contract|' + arr[i].GUID}])
            }
        }
        bot.sendMessage(msg.split('|')[1], choseorder, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: selectcontracts
            }
        })
    }
}
exports.getSverkaByClient = async (msg, type) => {
    const {id} = msg.from;
    let guid = myTasks.getUserType()[id]
    console.log(myTasks.getUserType()[id])
    let command = `?command=getSverkaByClient&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,  {
        guid: guid
    },
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
        },
    )
        .then(response => {
            const path = Path.resolve(
                __dirname,
                '../dist/pdf',
                `a${guid}a.${response.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            response.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/a${guid}a.${response.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/a${guid}a.${response.headers.file_type}`, (err) => {
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
exports.getKompraByClient = async (msg, type) => {
    const {id} = msg.from;
    let guid = myTasks.getUserType()[id]
    let command = `?command=getKompraByClient&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
        guid: guid
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
        .then(res => {
            let kompra = res.data.Contracts
            let btns = []
            if (kompra.length > 0) {
                for (let i = 0; i < kompra.length; i++) {

                    btns.push([{text: kompra[i].Представление, callback_data: 'kompra|' + kompra[i].GUID}])
                }
                bot.sendMessage(id, 'Получить отчет', {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                })
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getKompraPDFByGuid = async (guid, id) => {
    let command = `?command=getKompraPDFByGuid&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,{
        guid: guid
    },
        {
            responseType: 'stream',
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
    )
        .then((res) => {
            const path = Path.resolve(
                __dirname,
                '../dist/pdf',
                `a${guid}a.${res.headers.file_type}`,
            )
            // fs.writeFileSync(path, res.data, 'binary');
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
exports.getContractByGuid = async (id, guid) => {
    let command = `?command=getContractByGuid&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
        guid: guid
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
        },
    )
        .then((res) => {
            myTasks.setUserType(id, guid)
            data = {
                "nameObject": res.data.ИмяОбъекта,
                "guid": res.data.guid,
                "prefics": res.data.prefics
            }
            myTasks.setClientData(id, data)
            let name = res.data.Представление
            let message = stripHtml(res.data.description);
            message = message.replace(/[<>]/ig, "'");
            let html = `
<b>${name}</b>
<pre>${message}</pre>
   `;
            bot.sendMessage(id, html, {
                parse_mode: "HTML",
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: getcontract
                }
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getSellingByContract = async (msg) => {
    const {id} = msg.from;
    let guid = myTasks.getUserType()[id]
    await axios.get(`${config.ONE_C_URL}getSellingByContract`,
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
                guid: guid
            }
        },
    )
        .then((res) => {
            myTasks.setUserType(id, 'sell')
            let sell = res.data.Selling
            let btns = []
            if (sell.length > 0) {
                for (let i = 0; i < sell.length; i++) {
                    btns.push([{text: sell[i].Представление, callback_data: sell[i].GUID}])
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
exports.getInvoiceByContract = async (msg) => {
    const {id} = msg.from;
    let guid = myTasks.getUserType()[id]
    console.log(myTasks.getUserType())
    let command = `?command=getInvoiceByContract&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,{
        guid: guid
        },
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
exports.getSellingByGuid = async (id, guid) => {
    let command = `?command=getSellingByGuid&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
        guid: guid
    },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }, 
        },
    )
        .then((res) => {
            data = {
                "nameObject": res.data.ИмяОбъекта,
                "guid": res.data.guid,
                "prefics": res.data.prefics
            }
            myTasks.setUserType(id, null)
            myTasks.setClientData(id, data)
            let name = res.data.Представление
            let message = stripHtml(res.data.description);
            message = message.replace(/[<>]/ig, "'");
            let html = `
<b>${name}</b>
<pre>${message}</pre>
   `;
            bot.sendMessage(id, html, {
                parse_mode: "HTML",
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: getselling
                }
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}