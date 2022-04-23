const bot = require('../util/telegrambot').bots;
const getFileControllers = require('../controllers/getfiles');
const clientbyname = require('../controllers/clientbyname')
const myTasks = require('../util/myTasks');
global.arr = [];
bot.on('message', msg => {
    let fileid = null;
    const {id} = msg.from;
    if(msg.voice){
        fileid = msg.voice.file_id;
    }else if(msg.audio){
        fileid = msg.audio.file_id;
    }else if(msg.video){
        fileid = msg.video.file_id;
    }else if(msg.photo){
        var lastElement = msg.photo.pop();
        
        bot.on("polling_error", console.log);

        // for(var i=1;i<msg.photo.length;i++)
        // {
        //     global.arr.push(msg.photo[i].file)
        // }
     
        
       // fileid=lastElement;

        if(msg.photo[2]){
            fileid = msg.photo[2].file_id;
        }
        else if(msg.photo[1]){
            fileid = msg.photo[1].file_id;
        }
        else{
            fileid = msg.photo[0].file_id;
        }
    }
    else if(msg.document){
        fileid = msg.document.file_id;
    }
    if(myTasks.getUserType()[id.toString()] === 'nextstep' && msg.text !== 'Далее'){
        if(fileid){
            getFileControllers.getFiles(msg, fileid);
        }
    }
    if(myTasks.getUserType()[id.toString()] === 'putfile'){
        if(fileid){
            clientbyname.putFilesByGuid(msg, fileid);
            bot.on("polling_error", console.log);
        }
    }
});