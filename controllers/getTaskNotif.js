const bot1 = require('../bot/index');
const bot = require('../util/telegrambot').bots;
const stripHtml = require("string-strip-html");
const myTasks = require('../util/myTasks');
const cb_data = [];

exports.getTaskNotif = (req, res) => {
    let variants = req.body.task.ВариантыВыполнения;
    let id = req.body.telegram_id;
    let taskdata = {
        "task": {
            "guid": req.body.task.GUID,
            "nameObject": req.body.task.ИмяОбъекта,
            "prefics": req.body.task.prefics
        }
    };
    myTasks.setTasksData(id, taskdata);
    let fio = stripHtml(req.body.task.Представление);
    fio = fio.replace(/[<>]/ig,"'");
    let description = stripHtml(req.body.task.description);
    description = description.replace(/[<>]/ig,"'");
    let btns = [];
    let variantsName = [];
    if(variants.length > 0){
        for(i = 0; i < variants.length; i++){
            let variant = variants[i].ВариантИмя + '|' +
                variants[i].ВариантСиноним + '|' +
                variants[i].Индекс + '|' +
                variants[i].НомерВерсии;
            cb_data.push(variant);
            btns.push({
                text: variants[i].ВариантСиноним,
                callback_data: variants[i].ВариантИмя
            });
            variantsName.push(variants[i].ВариантИмя);
        }
    }
    myTasks.setCbdata(id, cb_data);
    myTasks.setTaskResult(id, variantsName);
    let html = `
                            <b>${fio}</b>
<pre>${description}</pre>
                            `;
    bot.sendMessage(id, html, {
        parse_mode : "HTML",
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [btns]
        }
    }).then(()=>{
        res.json({"message":"ok"});
    }).catch( e => {
        console.log(e.message);
        res.json({"message": e.message});
    });
};