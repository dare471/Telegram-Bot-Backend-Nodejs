const TelegramBot = require('node-telegram-bot-api');
// const TOKEN = '1211478592:AAFbXrxyy3n6_8lgofQZDMuGpgvHMG1Do28';
// const TOKEN = '1152261660:AAFj_ilx8ulzz-6SX5PtAfHxuy5DOhOJUcw';
const TOKEN = '1741079563:AAH8VPscj4UEfmFcZo71I63K4artoKqUV3E';
let botStart = '';

module.exports.botstart = () => {
    botStart = new TelegramBot(TOKEN, {
        polling: {
            interval: 300,
            autoStart: true,
            params: {
                timeout: 10
            }
        }
    });
    console.log("Bot started");
    module.exports.bots = botStart;
    return botStart
};




// 1152261660:AAFj_ilx8ulzz-6SX5PtAfHxuy5DOhOJUcw
// t.me/victorshkodaTest_bot
/*"id": 1125117256,
    "first_name": "Igor",
    "last_name": "Tokarev",*/