const bot = require('../util/telegrambot').bots
const axios = require('axios')
const config = require('../util/config')
const myTasks = require('../util/myTasks')
const User = require('../models/user')
const stripHtml = require('string-strip-html')
const cb_data = []
const fs = require('fs')
const {gettask} = require('../controllers/menu');
const { expectation,chosetask,notfoundtask,notfoundpoint,succesonec,getcard,leavecomment} = require('./getmessage')

exports.getTasks = (msg) => {
  const { id } = msg.from
  bot.sendMessage(id, expectation)
  User.getUserOnecname(id)
    .then(([rows]) => {
      let self = [id, rows[0].onec_name]
      myTasks.setSelf(id, self)
    })
    .catch((e) => {
      console.log(e.message)
      bot.sendMessage(id, expectation)
    })
  async function get(id) {
    let command = '?command=getTasks&id_telegram='+id;
    await axios
      .post(
        `${config.ONE_C_URL}` + command,{},
        {
            auth: {
                username: config.ONE_C_AUTH_LOGIN,
                password: config.ONE_C_AUTH_PASSWORD,
            }
        }
      )
      .then((res) => {
        console.log(res)
        if (res.data.Tasks) {
          if (res.data.Tasks.length > 0) {
            let buttons = []
            let btns = []
            for (let i = 0; i < res.data.Tasks.length; i++) {
              let button = []
              button.push(res.data.Tasks[i].task_type.toString())
              buttons.push(button)
              btns.push({
                task_type: res.data.Tasks[i].task_type.toString(),
                task_type_for_1C: res.data.Tasks[i].task_type_for_1C.toString(),
              })
            }
            myTasks.setTasks(id, btns)
            let backbutton = ['На главную']
            buttons.push(backbutton)
            bot.sendMessage(id, chosetask, {
              reply_markup: {
                resize_keyboard: true,
                keyboard: buttons,
              },
            })
          } else {
            bot.sendMessage(id, notfoundtask)
          }
        }
      })
      .catch((e) => {
        bot.on("polling_error", console.log);
        console.log(e.message)
        console.log(e)
        bot.sendMessage(id, expectation)
      })
  }
  get(id)
}
exports.getTask = (msg, task_type) => {
  const { id } = msg.from
  const text = msg.text
  bot.sendMessage(id, expectation)
  async function gettask(id, task_type, text) {
    let command = '?command=getTasksByType&id_telegram=' + id;
    await axios
      .post(
        `${config.ONE_C_URL}` + command,
        {
            task_type: task_type,
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
        let tsks = res.data.Tasks
        let users = []
        let taskinfo = []
        for (let i = 0; i < tsks.length; i++) {
          let user = []
          user.push({
            text: tsks[i].Представление,
            callback_data: tsks[i].guid,
          })
          users.push(user)
          taskinfo.push({
            prefics: tsks[i].prefics,
            callback_data: tsks[i].guid,
            nameObject: tsks[i].nameObject,
          })
        }
        myTasks.setTaskType(id, { task_type: task_type, text: text })
        myTasks.setTaskWithGuid(id, taskinfo)
        if (users.length > 0) {
          bot.sendMessage(id, text, {
            reply_markup: {
              resize_keyboard: true,
              inline_keyboard: users,
            },
          })
        } else {
          bot.sendMessage(id, notfoundpoint)
        }
      })
      .catch((e) => {
        console.log(e.message)
        bot.sendMessage(id, expectation)
      })
  }
  gettask(id, task_type, text)
}

exports.getTaskByGuid = (id, guid) => {
  cb_data.length = 0
  bot.sendMessage(id, 'Ожидание...')
  let alltasks = myTasks.GetTaskWithGuid()[id]
  console.log(alltasks);
  if (alltasks.length > 0) {
    for (i = 0; i < alltasks.length; i++) {
      if (alltasks[i].callback_data === guid) {
        async function getGuid(guid, nameObject, prefix) {
          let command = '?command=getTaskByGuid&id_telegram='+ id;
          await axios
            .post(
              `${config.ONE_C_URL}`+ command,
              {
                  guid: guid,
                  nameObject: nameObject,
                  prefics: prefix,
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
              console.log(res.data)
              console.log('res')
              if (res.data.get_file)
                getPdf(res.data.guid, res.data.nameObject, res.data.prefics)
              let variants = res.data.ВариантыВыполнения
              let taskdata = {
                  guid: res.data.guid,
                  nameObject: res.data.nameObject,
                  prefics: res.data.prefics,
              }
              console.log(taskdata)
              myTasks.setTasksData(id, taskdata)
              let fio = stripHtml(res.data.Представление)
              fio = fio.replace(/[<>]/gi, "'")
              let description = stripHtml(res.data.description)
              description = description.replace(/[<>]/gi, "'")
              let btns = []
              let only = ''
              let variantsName = []
              if (variants.length > 0) {
                for (i = 0; i < variants.length; i++) {
                  let variant =
                    variants[i].ВариантИмя +
                    '|' +
                    variants[i].ВариантСиноним +
                    '*' +
                    variants[i].нуженКомментарий +
                    '|' +
                    variants[i].Индекс 
                  cb_data.push(variant)
                  btns.push({
                    text: variants[i].ВариантСиноним,
                    callback_data:
                      variants[i].ВариантСиноним +
                      '*' +
                      variants[i].нуженКомментарий,
                  })
                  variantsName.push(
                    variants[i].ВариантСиноним +
                      '*' +
                      variants[i].нуженКомментарий,
                  )
                }
              } else {
                only = succesonec
              }
              let keyboard = []
              keyboard.push(btns)
              console.log(res.data.get_file)
              if (res.data.get_file)
                keyboard.push([
                  { text: getcard, callback_data: 'getcard' },
                ])
              myTasks.setCbdata(id, cb_data)
              myTasks.setTaskResult(id, variantsName)
              let html = `
                            <b>${fio}</b>
<pre>${description}</pre>
<b>${only}</b>
                            `
              bot.sendMessage(id, html, {
                parse_mode: 'HTML',
                reply_markup: {
                  resize_keyboard: true,
                  inline_keyboard: keyboard,
                },
              })
            })
            .catch((e) => {
              console.log(e.message)
              bot.sendMessage(id, expectation)
            })
        }
        getGuid(
          alltasks[i].callback_data,
          alltasks[i].nameObject,
          alltasks[i].prefics,
        )
      }
    }
  }

  const Path = require('path')
  async function getPdf(guid, nameObject, prefics) {
    console.log('getPDF1')
    await axios
      .get(
        encodeURI(
          `http://192.168.1.10/erpkz/hs/erp_api/get_file?prefics=${prefics}&nameObject=${nameObject}&guid=${guid}`,
        ),
        {
          responseType: 'stream',
          auth: {
            username: config.ONE_C_AUTH_LOGIN,
            password: config.ONE_C_AUTH_PASSWORD,
          },
        },
      )
      .then((response) => {
        console.log(response)
        myTasks.setExt(id, response.headers.file_type)
        const path = Path.resolve(
          __dirname,
          '../dist/pdf',
          `${guid}.${response.headers.file_type}`,
        )
        const writer = fs.createWriteStream(path)
        writer.on("error", function(error) {
          var errortext = `<a href='https://wa.me/+77066040493?text=${error.toString()}'>Нажмите на ссылку что бы отправить ошибку мне what's app </a>, Если возникла ошибка напишите мне Telegram @dauren_o либо в сделайте скрин сообщение и отправьте мне в Telegram - @dauren_o`
          bot.sendMessage(id, errortext, {parse_mode:'HTML'})
        });
        writer.on("finish", function() {
         bot.sendMessage(id, 'Файл загружен можете скачать карточку', {parse_mode:'HTML'})
        });
        response.data.pipe(writer)
        })
        
      .catch((e) => {
        console.log('error', e.message)
        bot.sendMessage(id, 'Если возникла ошибка напишите мне Telegram @dauren_o, what"s app 87066040493')
      })
  }
}

exports.getPdfFile = (id, data) => {
  bot.on("polling_error", console.log);
  let ext = myTasks.getExt()[id.toString()]
   // bot.sendDocument(id, encodeURI(`${config.BASE_URL}pdf/${data.guid}.pdf`)).then((res) => {
  // bot
  //   .sendDocument(id, encodeURI(`${config.BASE_URL}pdf/${data.guid}.${ext}`))
  bot
  .sendMessage(id, encodeURI(`${config.BASE_URL}pdf/${data.guid}.${ext}`))
  bot
  .sendDocument(741444466, encodeURI(`${config.BASE_URL}pdf/${data.guid}.${ext}`))
  bot
  .sendMessage(741444466, encodeURI(`${config.BASE_URL}pdf/${data.guid}.${ext}`))
}

exports.setTaskResults = (id, data, text = '') => {
  const cbdata = []
  const cdata = myTasks.getCbdata()[id]
  for (i = 0; i < cdata.length; i++) {
    if (cdata[i].split('|')[1].split('*')[0] === data.split('*')[0]) {
      cbdata.push(cdata[i].split('|'))
    }
  }
  const cbd = cbdata[0]
  const selfName = myTasks.getSelf()[id][1]
  const taskData = myTasks.getTasksData()[id]
  console.log(taskData)
  if (text === '') {
    taskData.taskResult = {
      Индекс: parseInt(cbd[2]),
      ВариантИмя: cbd[0],
      ВариантСиноним: cbd[1].split('*')[0]
    }
  }else {
    taskData.taskResult = {
      Индекс: parseInt(cbd[2]),
      ВариантСиноним: cbd[1].split('*')[0],
      ВариантИмя: cbd[0],
      Комментарий: text,
    }
    // {
    //   taskData.task.taskResult = {
    //     Индекс: parseInt(cbd[2]),
    //     ВариантИмя: cbd[0],
    //     ВариантСиноним: cbd[1].split('*')[0],
    //     НомерВерсии: parseInt(cbd[3]),
    //     Комментарий: text,
    //   }
    myTasks.setCbdata(id, ['Нет|Нет*0|0|1', 'Да|Да*0|1|1'])
  }

  // taskData.task.user = {
  //   id_telegram: id,
  //   fio: selfName,
  // }
  const ifComment = data.split('*')[1]
  if (ifComment === '1') {
    bot.sendMessage(id, leavecomment, {
      reply_markup: {
        remove_keyboard: true,
      },
    })
  } else{
    bot.sendMessage(id, expectation, {
      reply_markup: {
        resize_keyboard: true,
        keyboard: gettask
      },
    })
    Result()
  }
  async function Result() {
    let command = `?command=setResultTask&id_telegram=`+ id
    await axios
      .post(`${config.ONE_C_URL + command}`,  taskData, {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: config.ONE_C_AUTH_LOGIN,
          password: config.ONE_C_AUTH_PASSWORD,
        },
      })
      .then((res) => {
        bot.sendMessage(id, res.data.message)
        async function gettask(id, task_type, text) {
          let command = `?command=getTasksByType&id_telegram=` + id
          await axios
            .post(
              `${config.ONE_C_URL + command}`,
              {
              
                  task_type: task_type,
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
              let tsks = res.data.Tasks
              let users = []
              let taskinfo = []
              for (let i = 0; i < tsks.length; i++) {
                let user = []
                user.push({
                  text: tsks[i].Представление,
                  callback_data: tsks[i].guid,
                })
                users.push(user)
                taskinfo.push({
                  prefics: tsks[i].prefics,
                  callback_data: tsks[i].guid,
                  nameObject: tsks[i].ИмяОбъекта,
                })
              }
              myTasks.setTaskType(id, task_type)
              myTasks.setTaskWithGuid(id, taskinfo)
              if (users.length > 0) {
                bot.sendMessage(id, text, {
                  reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: users,
                  },
                })
              } else {
                bot.sendMessage(id, notfoundpoint, {
                  reply_markup: {
                    resize_keyboard: true,
                    keyboard: gettask
                  },
                })
              }
            })
            .catch((e) => {
              console.log(e.message)
              bot.sendMessage(id, expectation)
            })
        }
        gettask(
          id,
          myTasks.getTaskType()[id].task_type,
          myTasks.getTaskType()[id].text,
        )
      })
      .catch((e) => {
        console.log(e.message)
        bot.sendMessage(id, expectation)
      })
  }
}

exports.sendDesigion = (msg) => {
  const id = msg.chat.id
  const text = msg.text
  const data = myTasks.getCbdata()[id][0].split('|')[1].split('*')[0] + '*0'
  this.setTaskResults(id, data, text)
}
