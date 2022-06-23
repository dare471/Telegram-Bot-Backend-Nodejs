const bot1 = require('../bot/index');
const bot = require('../util/telegrambot').bots;
const stripHtml = require("string-strip-html");
const {menu} = require('../controllers/menu')

exports.setNotification = (req, res) => {
    let id = parseInt(req.body.telegram_id);
    let task = stripHtml(req.body.task_type);
    let message = stripHtml(req.body.message);
    task = task.replace(/[<>]/ig,"'");
    message = message.replace(/[<>]/ig,"'");
    let html = `
<b>Новое уведомление\n${task}</b>
<pre>${message}</pre>
   `;
    bot.sendMessage(id, html, {
        parse_mode : "HTML",
        reply_markup: {
            resize_keyboard: true,
            keyboard: menu
        }
    }).then(()=>{
        res.json({"message":"ok"});
    }).catch( e => {
        console.log(e.message);
        res.json({"message": e.message});
    });
};