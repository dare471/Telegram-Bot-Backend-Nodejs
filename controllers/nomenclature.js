const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const myTasks = require('../util/myTasks');
const stripHtml = require("string-strip-html");
const Path = require('path')
const error = require('../controllers/error')
const {menu, menusop, nomenclature,nomeclatureget,nomeclaturegetproductby,nomeclaturegetwarehouse,autopark} = require("../controllers/menu")
const { expectation,chosemanufacture,continued,selectdocument,choseaction,notdata,enterfoursym,mustbebysymbolsthree,mustbebysymbolsfour,choseproduct,chosecategory,continuedtol,fwhatwarehouse,chosewarehouse,entertypecert,entercert} = require('../controllers/getmessage')

//nomenclature
exports.mainNomenclature = msg => {
    const {id} = msg.from;
    bot.sendMessage(id, choseaction, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: nomenclature
        }
    });
}

exports.ReportSop = msg =>{
    const { id } = msg.from;
    bot.sendMessage(id, choseaction, {
        reply_markup:{
            resize_keyboard: true,
            keyboard: menusop
        }
    });
}


exports.findShippingByNumber = async (msg) => {
    const {id} = msg.from;
    myTasks.setUserType(id, 'getShippingByNumber')
    bot.sendMessage(id, mustbebysymbolsthree, {
        reply_markup: {
            resize_keyboard: true
        }
    });
    
}

exports.getShippingByNumber = async (msg) => {
    const {id} = msg.from;
    const find = msg.text;
    let command = `?command=getShippingByNumber&id_telegram=` + id
    getShippingByNumber
    await axios.post(`${config.ONE_C_URL + command}`, 
        {
            number: find
        },
        {   
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD
            },    
        },
    )
        .then((res) => {
            if(res.data.docs){
                var resp = res.data.docs;
                for (let i = 0; i < resp.length; i++) {
                    myTasks.getData(res.data.docs[0].description)
                    // myTasks.getClientData()[0]
                    myTasks.getFileData(res.data.docs[0])
                    bot.sendMessage(id, selectdocument, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: [
                                [
                                    {
                                        text: resp[i].Представление, callback_data: 'predstavlenie'
                                    }
                                ]
                            ]
                        }
                    }); 
                    error.errorsend(console.log)
                }  
            }
            else{
                bot.sendMessage(id, res.data.message, {reply_markup: {
                    resize_keyboard: true,
                    keyboard: nomenclature
                }});
            }
            
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, res.data.message, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: nomenclature
                }
            });
        })
}
exports.findProductByName = msg => {
    const {id} = msg.from;
    console.log('1')
    myTasks.setUserType(id, 'productname')
    bot.on("polling_error", console.log);
    bot.sendMessage(id, enterfoursym, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}
exports.getProductByName = async msg => {
    const name = msg.text
    bot.on("polling_error", console.log);
    const {id} = msg.from
    let command = `?command=getProductByName&id_telegram=` + id
    if (name.length < 4) {
        bot.sendMessage(id, mustbebysymbolsfour)
    } else {
        myTasks.setUserType(id, 'getProductByName')
        await axios.post(`${config.ONE_C_URL + command}`,  {
            name: name
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
                let products = res.data.Product
                myTasks.setArrNom(id, res.data.Product)
                if (Array.isArray(products) && products.length > 0) {
                    let btns = []
                    for (let i = 0; i < products.length; i++) {
                        btns.push([{text: products[i].Представление, callback_data: products[i].guid}])
                    }
                    bot.sendMessage(id, choseproduct, {
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
                            keyboard: nomenclature
                        }
                    });
                }
            })
            .catch((e) => {
                error.errorsend(console.log)
                bot.sendMessage(id, expectation)
            })
    }
}
exports.getCategory = async msg => {
    const {id} = msg.from;
    let command = `?command=getCategory&id_telegram=`+id
    myTasks.setUserType(id, 'getCategory')
    await axios.post(`${config.ONE_C_URL + command}`,
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
            let category = res.data.Category
            if (Array.isArray(category) && category.length > 0) {
                let btns = []
                for (let i = 0; i < category.length; i++) {
                    btns.push([{text: category[i].Представление, callback_data: category[i].guid}])
                }
                bot.sendMessage(id, chosecategory, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, chosecategory)
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getProductByCategory1 = msg => {
    const {id} = msg.from;
    let product = myTasks.getAllproducts()[id]
    let btns = []
    if (product.length > 10) {
        for (let i = 0; i < 10; i++) {
            btns.push([{text: product[i].Представление, callback_data: product[i].GUID}])
        }
        product.splice(0, 10)
        myTasks.setAllproducts(id, product)
        bot.sendMessage(id, choseproduct, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: btns
            }
        }).then(() => {
            bot.sendMessage(id, continuedtol, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: nomeclatureget
                }
            })
        })
    } else {
        for (let i = 0; i < product.length; i++) {
            btns.push([{text: product[i].Представление, callback_data: product[i].GUID}])
        }
        myTasks.setAllproducts(id, 0)
        bot.sendMessage(id, choseproduct, {
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: btns
            }
        }).then(() => {
            bot.sendMessage(id, choseproduct, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        ['На главную']
                    ]
                }
            })
        }).catch((e) => {
            error.errorsend(console.log)
        })
    }
}
exports.getProductByCategory = async (id, guid) => {
    let command = `?command=getProductByCategory&id_telegram=` + id
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
            let product = res.data.Product
            if (Array.isArray(product) && product.length > 0) {
                if (product.length > 20) {
                    myTasks.setUserType(id, 'getProductByName')
                    let count = Math.floor(product.length / 20)
                    if ((product.length % 20) > 0) count = count + 1
                    myTasks.setCounter(id, count)
                    let btns = []
                    for (let i = 0; i < 20; i++) {
                        btns.push([{text: product[i].Представление, callback_data: product[i].guid}])
                    }
                    product.splice(0, 20)
                    myTasks.setAllproducts(id, product)
                    bot.sendMessage(id, choseproduct, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: btns
                        }
                    }).then(() => {
                        bot.sendMessage(id, continuedtol, {
                            reply_markup: {
                                resize_keyboard: true,
                                keyboard: nomeclatureget
                            }
                        })
                    })
                } else {
                    myTasks.setUserType(id, 'getProductByName')
                    let btns = []
                    for (let i = 0; i < product.length; i++) {
                        btns.push([{text: product[i].Представление, callback_data: product[i].guid}])
                    }
                    bot.sendMessage(id, choseproduct, {
                        reply_markup: {
                            resize_keyboard: true,
                            inline_keyboard: btns
                        }
                    })
                }
            } else {
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            error.errorsend(e)
            bot.sendMessage(id, expectation)
        })
}
exports.getProductByGuid = async (id, guid) => {
    console.log('getProductByGuid', id, guid)
    let command = `?command=getProductByGuid&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command }`,{
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
            error.errorsend(message)
            let html = `
<b>${name}</b>
<pre>${message}</pre>
   `;
            bot.sendMessage(id, html, {
                parse_mode: "HTML",
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: nomeclaturegetproductby
                }
            })
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.leftoverGoods = msg => {
    const {id} = msg.from;
    bot.sendMessage(id, fwhatwarehouse, {
        reply_markup: {
            resize_keyboard: true,
            keyboard:nomeclaturegetwarehouse
        }
    });
}
exports.getStockByProduct = async msg => {
    const {id} = msg.from;
    let guid = myTasks.getUserType()[id]
    let command = `?command=getStockByProduct&id_telegram=` + id
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
                `Все склады остатки товара ${guid}a.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Все склады остатки товара ${guid}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/Все склады остатки товара ${guid}a.${res.headers.file_type}`, (err) => {
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
                        keyboard: nomenclature
                    }
                })
            })
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getStocks = async msg => {
    const {id} = msg.from;
    let command = `?command=getStocks&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,
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
            let stocks = res.data.Stocks
            if (Array.isArray(stocks) && stocks.length > 0) {
                myTasks.setClientData(id, myTasks.getUserType()[id])
                myTasks.setUserType(id, 'getStocks')
                let btns = []
                for (let i = 0; i < stocks.length; i++) {
                    btns.push([{text: stocks[i].Представление, callback_data: stocks[i].GUID}])
                }
                bot.sendMessage(id, chosewarehouse, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, chosewarehouse)
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getStockByProductAndStock = async (id, guid) => {
    let guid_product = myTasks.getClientData()[id]
    console.log(guid_product, guid)
    let command = `?command=getStockByProductAndStock&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,{
            guidProduct: guid_product,
            guidStock: guid
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
                `Остатки товара ${guid_product}${guid}a.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot.sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Остатки товара ${guid_product}${guid}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/Остатки товара ${guid_product}${guid}a.${res.headers.file_type}`, (err) => {
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
                        keyboard: nomenclature
                    }
                })
            })
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getTypeCertByProduc = async msg => {
    const {id} = msg.from;
    let command = `?command=getTypeCertByProduct&id_telegram=` + id
    let guid = myTasks.getUserType()[id]
    await axios.post(`${config.ONE_C_URL + command}`,  {
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
            myTasks.setUserType(id, 'getTypeCertByProduct')
            myTasks.setClientData(id, guid)
            let cert = res.data.Cert
            if (Array.isArray(cert) && cert.length > 0) {
                myTasks.setUserType(id, 'getTypeCertByProduct')
                let btns = []
                for (let i = 0; i < cert.length; i++) {
                    btns.push([{text: cert[i].Представление, callback_data: cert[i].Представление}])
                }
                bot.sendMessage(id, entertypecert, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, entertypecert, {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                ['На главную']
                            ]
                        }
                    })
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getCertByProduct = async (id, type) => {
    let guid = myTasks.getClientData()[id]
    let data = {
        guid: guid,
        type: type
    }
    let command = `?command=getCertByProduct&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, data,
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
            let cert = res.data.Cert
            if (Array.isArray(cert) && cert.length > 0) {
                myTasks.setUserType(id, 'getFilesCertByGUID')
                let btns = []
                for (let i = 0; i < cert.length; i++) {
                    btns.push([{text: cert[i].Представление, callback_data: cert[i].guid}])
                }
                bot.sendMessage(id, entercert, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, entercert, {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                ['На главную']
                            ]
                        }
                    })
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getFilesCertByGUID = async (id, guid) => {
    let command = `?command=getFilesCertByGUID&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
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
                `Сертификат ${guid}a.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Сертификат ${guid}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/Сертификат ${guid}a.${res.headers.file_type}`, (err) => {
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
            error.errorsend(console.log)
            bot.sendMessage(id, expectation)
        })
}
exports.getStockAll = async msg => {
    const {id} = msg.from;
    let command = `?command=getStocks&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`,{
            id_telegram: id
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
            let stocks = res.data.Stocks
            if (Array.isArray(stocks) && stocks.length > 0) {
                myTasks.setUserType(id, 'getStocksAll')
                let btns = []
                for (let i = 0; i < stocks.length; i++) {
                    btns.push([{text: stocks[i].Представление, callback_data: stocks[i].guid}])
                }
                bot.sendMessage(id, chosewarehouse, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, chosewarehouse)
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: nomenclature
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getStockByStock = async (id, guid) => {
    let command = `?command=getStockByStock&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
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
                `a${guid}d.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/a${guid}d.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/a${guid}d.${res.headers.file_type}`, (err) => {
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
                        keyboard: nomenclature
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getPlanAllSOPByProduct = async msg =>{
    console.log(msg)
    let { id } = msg.from
    let date = msg.date
    let command = `?command=getPlanSOPByProduct&id_telegram=` + id
    let guid = myTasks.getUserType()[id]
    console.log(id)
    await axios.post(`${config.ONE_C_URL + command}`, {
            guid: "all"
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
                `a${date}a.${res.headers.file_type}`,
            )
            console.log(path)
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/a${date}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/a${date}a.${res.headers.file_type}`, (err) => {
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
                bot.sendMessage(id, 'Отчет всей номенклатуре по исполнения плана SOP', {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menusop
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getReportSopProduct = async msg => {
    let { id } = msg.from
    let command = `?command=getPlanSOPByProduct&id_telegram=` + id
    let guid = myTasks.getUserType()[id]
    console.log(id)
    await axios.post(`${config.ONE_C_URL + command}`, {
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
            console.log(path)
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
                }).then(() => {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, 'Отчет исполнения плана SOP', {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menusop
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}
exports.getManufacture = async msg => {
    let { id } = msg.from 
    myTasks.setUserType(id, 'GetReportSopManufacture')
    bot.sendMessage(id, 'Напишите название производителя (минимум 4 буквы)',{
        reply_markup: {
            remove_keyboard: true
        }
    })
}

exports.getSearchNameManufacture = async msg => {
    let name = msg.text
    let { id } = msg.from
    let  date  = msg.date
    let command = `?command=getManufactureProductByName&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
            name: name
        },
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            },
        },
    )
        .then((res) => {
            let manufacture = res.data.Manufacture
            if (Array.isArray(manufacture) && manufacture.length > 0) {
                myTasks.setUserType(id, 'getManufactureStocks')
                let btns = []
                for (let i = 0; i < manufacture.length; i++) {
                    btns.push([{text: manufacture[i].Представление, callback_data: manufacture[i].guid}])
                }
                bot.sendMessage(id, chosemanufacture, {
                    reply_markup: {
                        resize_keyboard: true,
                        inline_keyboard: btns
                    }
                }).then(() => {
                    bot.sendMessage(id, chosemanufacture)
                })
            } else {
                myTasks.setUserType(id, '')
                bot.sendMessage(id, notdata, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menusop
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}

exports.getReportSopManufacture = async (id, guid) => {
    console.log(id, guid)
    let command = `?command=getPlanSOPByManufactureProduct&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
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
                `Поставщик-${guid}a.${res.headers.file_type}`,
            )
            const writer = fs.createWriteStream(path)
            res.data.pipe(writer)
            bot
                .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/Поставщик-${guid}a.${res.headers.file_type}`))
                .then(() => {
                    fs.unlink(`dist/pdf/Поставщик-${guid}a.${res.headers.file_type}`, (err) => {
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
                bot.sendMessage(id, choseaction, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menusop
                    }
                })
            })
        })
        .catch((e) => {
            console.log(e.message)
            bot.sendMessage(id, expectation)
        })
}