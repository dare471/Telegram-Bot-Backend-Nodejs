const Contacts = require('../models/contacts');
const bot = require('../util/telegrambot').bots;
const fs = require('fs');
const axios = require('axios');
const config = require('../util/config');
const {menu} = require('../controllers/menu');

exports.getContacts = (msg) => {
    const { id } = msg.from;
    Contacts.getAllContacts()
        .then(([rows]) => {
            let users = [];
            for(let i = 0; i < rows.length; i++){
                users.push({text: rows[i].onec_name,callback_data: rows[i].id_telegram})
            }
            var pairs = [];
            for (var i=0 ; i<users.length ; i+=2) {
                if (users[i+1] !== undefined) {
                    pairs.push ([users[i], users[i+1]]);
                } else {
                    pairs.push ([users[i]]);
                }
            }
            bot.sendMessage(id, 'Контакты', {
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: pairs
                }
            })
        })
        .catch(e => {
            console.log(e.message);
        });

};

exports.setContact = (msg, iduser) => {
    const idContact = parseInt(iduser);
    const {id} = msg.from;
    Contacts.getContact(id)
        .then(([rows]) => {
            bot.sendMessage(id, 'Отправка...');
            setTimeout(() => {
                bot.sendMessage(idContact, `От контакта ${rows[0].onec_name}`);
                if(msg.photo){
                    if(msg.photo[2]){fileid = msg.photo[2].file_id;}
                    else if(msg.photo[1]){fileid = msg.photo[1].file_id;}
                    else{fileid = msg.photo[0].file_id;}
                    bot.getFile(fileid).then(() => {
                        bot.sendPhoto(idContact, fileid);
                    });
                }else if(msg.voice){
                    fileid = msg.voice.file_id;
                    bot.getFile(fileid).then(() => {
                        bot.sendVoice(idContact, fileid);
                    });
                }else if(msg.audio){
                    fileid = msg.audio.file_id;
                    bot.getFile(fileid).then(() => {
                        bot.sendAudio(idContact, fileid);
                    });
                }else if(msg.video){
                    fileid = msg.video.file_id;
                    bot.getFile(fileid).then(() => {
                        bot.sendVideo(idContact, fileid);
                    });
                }else if(msg.document){
                    fileid = msg.document.file_id;
                    bot.getFile(fileid).then(() => {
                        bot.sendDocument(idContact, fileid);
                    });
                }else if(msg.text){
                    bot.sendMessage(idContact, msg.text);
                }
                bot.sendMessage(id, 'Отправлено', {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: menu
                    }
                });
            }, 500);

        })
        .catch(e => {
            console.log(e.message);
        });
};