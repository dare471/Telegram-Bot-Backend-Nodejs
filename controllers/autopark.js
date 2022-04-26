const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const stripHtml = require("string-strip-html");
const {menu, autopark, myauto, getoil} = require("../controllers/menu");
const {expectation, choseaction, choseauto, chosetemplate,filesend, errordate, sendapplicationto, enterdate, enter,mustdate, entercontent, enterquanlitre, chosegsm, chosemaps, maps, enterodometr, chosenumber } = require('../controllers/getmessage');

exports.mainQuery = msg => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    bot.sendMessage(id, choseaction, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: autopark
        }
    });
    
}
exports.getMyAuto = async msg => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    await axios.get(`${config.ONE_C_URL}getMyAuto`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
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
            myTasks.setUserType(id, 'myauto')
            let auto = res.data.Auto
            let btns = []
            if (auto.length > 0) {
                for (let i = 0; i < auto.length; i++) {
                    btns.push([{text: auto[i].Представление, callback_data: auto[i].GUID}])
                }
                bot.sendMessage(id, choseauto, {
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
                        keyboard: autopark
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.findAutoByNumber = msg => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    myTasks.setUserType(id, 'getAutoByNumber')
    bot.sendMessage(id, chosenumber, {
        reply_markup: {
            remove_keyboard: true
        }
    });
}
exports.getAutoByNumber = async (msg) => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    const number = msg.text
    await axios.get(`${config.ONE_C_URL}getAutoByNumber`,
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
            var auto = res.data.Auto;
            let btns = []

            if (auto.length > 0) {
                myTasks.getFileData(auto)
                myTasks.setUserType(id, 'myauto')

                for (let i = 0; i < auto.length; i++) {
                    btns.push([{text: auto[i].Представление, callback_data: auto[i].GUID}])
                }
                bot.sendMessage(id, choseauto, {
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
                        keyboard: autopark
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getAutoByGuid = async (id, guid) => {
    bot.on("polling_error", console.log);
    await axios.get(`${config.ONE_C_URL}getAutoByGuid`,
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
        }
    )
        .then((res) => {
            myTasks.getFileData(res.data)
            data = {
                "nameObject": res.data.ИмяОбъекта,
                "guid": res.data.GUID,
                "prefics": res.data.prefics
            }
            myTasks.setClientData(id, data)
            global.auto_g = res.data.GUID  
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
                    keyboard: myauto
                }
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getOdometerAuto = async (msg) => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    myTasks.setUserType(id, 'setOdometAuto')
    bot.sendMessage(id, enterodometr, {
        reply_markup: {
            resize_keyboard: true
        }
    });
    console.log(global.auto_g);
    
}

exports.setOdometAuto = async (msg) => {
    const {id} = msg.from;
    const number = msg.text;
    const json = {
        "guid_auto": data.guid,
        "odometr": number,
        "id_telegram": id
      };
    console.log(data.guid)
    await axios.post(`${config.ONE_C_URL}setOdometerAuto`, json,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD
            }
        },
    ).then((res) => {
            console.log(res)
            bot.sendMessage(id, 'Показания зафиксированы');
            
        })
        .catch((e) => {
            console.log(e.message)
           
        });
}

exports.getMyOilCard = async (msg) => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    await axios.get(`${config.ONE_C_URL}getMyOilCard`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
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
            let myoilcard = res.data.MyOilCard
            let btns = []
            if (myoilcard.length > 0) {
                myTasks.setUserType(id, 'myoilcard')
                for (let i = 0; i < myoilcard.length; i++) {
                    btns.push([{text: myoilcard[i].Представление, callback_data: myoilcard[i].GUID}])
                }
                bot.sendMessage(id, maps, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                })
                setTimeout(function () {
                    bot.sendMessage(id, chosemaps, {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }, 100)
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, chosemaps, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: autopark
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getTypeOil = async (id, guid) => {
    bot.on("polling_error", console.log);
    await axios.get(`${config.ONE_C_URL}getTypeOil`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
            params: {
                id_telegram: id
            }
        }
    )
        .then((res) => {
            let oiltype = res.data.TypeOil
            let btns = []
            if (oiltype.length > 0) {
                myTasks.setUserType(id, 'oiltype')
                let data = {
                    "guid_oilCard": guid
                }
                myTasks.setClientData(id, data)
                for (let i = 0; i < oiltype.length; i++) {
                    btns.push([{text: oiltype[i].Представление, callback_data: oiltype[i].GUID}])
                }
                bot.sendMessage(id, chosegsm, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                })
                setTimeout(function () {
                    bot.sendMessage(id, chosegsm)
                }, 100)

            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: autopark
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getOilCount = (id, guid) => {
    bot.on("polling_error", console.log);
    let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
    let data = {
        "guid_oilCard": guid_oilCard,
        "guid_typeOil": guid
    }
    myTasks.setClientData(id, data)
    myTasks.setUserType(id, 'oilcount')
    bot.sendMessage(id, enterquanlitre)
}
exports.getDesc = msg => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    const oilcount = msg.text
    let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
    let guid_typeOil = myTasks.getClientData()[id].guid_typeOil
    let data = {
        "guid_oilCard": guid_oilCard,
        "guid_typeOil": guid_typeOil,
        "count": oilcount
    }
    myTasks.setClientData(id, data)
    myTasks.setUserType(id, 'oildeck')
    bot.sendMessage(id, entercontent)
}

exports.getOilDate = msg => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    const description = msg.text
    let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
    let guid_typeOil = myTasks.getClientData()[id].guid_typeOil
    let count = myTasks.getClientData()[id].count
    let data = {
        "guid_oilCard": guid_oilCard,
        "guid_typeOil": guid_typeOil,
        "count": count,
        "desc": description
    }
    myTasks.setClientData(id, data)
    myTasks.setUserType(id, 'oildate')
    let nowdate = +new Date();
    const dateTimeFormat = new Intl.DateTimeFormat('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    })
    let [{value: month}, , {value: day}, , {value: year}] = dateTimeFormat.formatToParts(nowdate)

    let today = `${year}${month}${day}`
    let tomorrow = `${year}${month}${parseInt(day)+1}`
    let afer2day = `${year}${month}${parseInt(day)+2}`
    let afer3day = `${year}${month}${parseInt(day)+3}`
    bot.sendMessage(id, mustdate, {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [{text: 'Сегодня', callback_data: `setdateoil|${today}`}],
                [{text: 'Завтра', callback_data: `setdateoil|${tomorrow}`}],
                [{text: 'Через 2 дня', callback_data: `setdateoil|${afer2day}`}],
                [{text: 'Через 3 дня', callback_data: `setdateoil|${afer3day}`}]
            ]
        }
    })
        .then(() => {
            bot.sendMessage(id, enter, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: getoil
                }
            })
        })
}
exports.customDate = (id) => {
    bot.on("polling_error", console.log);
    myTasks.setUserType(id, 'newcustomdateoil')
    bot.sendMessage(id, enterdate, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

exports.isShure = (id, date) => {
    bot.on("polling_error", console.log);
    let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
    let guid_typeOil = myTasks.getClientData()[id].guid_typeOil
    let count = myTasks.getClientData()[id].count
    let description = myTasks.getClientData()[id].desc
    let data = {
        "guid_oilCard": guid_oilCard,
        "guid_typeOil": guid_typeOil,
        "count": count,
        "desc": description,
        "due": date
    }
    myTasks.setClientData(id, data)
    myTasks.setUserType(id, '')
    bot.sendMessage(id, sendapplicationto, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: isshure
        }
    });
}
exports.getCustomDate = (msg) => {
    bot.on("polling_error", console.log);
    const {id} = msg.from;
    let sendeddate = msg.text.split('.')
    if(sendeddate.length === 3){
        if(sendeddate[0].length === 2 && parseInt(sendeddate[0]) < 32  && sendeddate[1].length === 2 && parseInt(sendeddate[1]) < 13 && sendeddate[2].length === 4 && parseInt(sendeddate[2]) > 2020){
            let date = `${sendeddate[2]}${sendeddate[1]}${sendeddate[0]}`
            let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
            let guid_typeOil = myTasks.getClientData()[id].guid_typeOil
            let count = myTasks.getClientData()[id].count
            let description = myTasks.getClientData()[id].desc
            let data = {
                "guid_oilCard": guid_oilCard,
                "guid_typeOil": guid_typeOil,
                "count": count,
                "desc": description,
                "due": date
            }
            myTasks.setClientData(id, data)
            myTasks.setUserType(id, '')
            bot.sendMessage(id, sendapplicationto, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: isshure
                }
            });
        }else{
            bot.sendMessage(id, errordate)
        }
    }else{
        bot.sendMessage(id, errordate)
    }
}
exports.setNeedOil = async (msg) => {
    const {id} = msg.from;
    let guid_oilCard = myTasks.getClientData()[id].guid_oilCard
    let guid_typeOil = myTasks.getClientData()[id].guid_typeOil
    let count = myTasks.getClientData()[id].count
    let desc = myTasks.getClientData()[id].desc
    let oildate = myTasks.getClientData()[id].due
    let data = {
        "guid_oilCard": guid_oilCard,
        "guid_typeOil": guid_typeOil,
        "count": count,
        "desc": desc,
        "due": oildate,
        "id_telegram": id
    }
    await axios.post(`${config.ONE_C_URL}setNeedOil`, data,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
    )
        .then((res) => {
            myTasks.setClientData(id, null)
            myTasks.setUserType(id, 'oildate')
            bot.sendMessage(id, filesend, {
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
exports.getDoc = msg => {
    const {id} = msg.from;
    bot.sendMessage(id, chosetemplate, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: aktauto
        }
    })
}
exports.getAktAuto = msg => {
    const {id} = msg.from;
    bot.sendDocument(id, encodeURI(`${config.BASE_URL}docs/akty_na_transport.pdf`))
}
exports.getAktCard = msg => {
    const {id} = msg.from;
    bot.sendDocument(id, encodeURI(`${config.BASE_URL}docs/akty_na_toplivnye_karty.pdf`))
}
exports.getList = msg => {
    const {id} = msg.from;
    bot.sendDocument(id, encodeURI(`${config.BASE_URL}docs/putevoi_list.pdf`))
}