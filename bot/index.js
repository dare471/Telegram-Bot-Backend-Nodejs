const bot = require('../util/telegrambot').botstart()
const userController = require('../controllers/users')
const getFile = require('../controllers/getfiles')
const checkUsreController = require('../controllers/checkUser')
const getTasksController = require('../controllers/getTasks')
const personelHelp = require('../controllers/рersonnelAndHelp')
const clientswork = require('../controllers/clientswork')
const clientbyname = require('../controllers/clientbyname')
const autopark = require('../controllers/autopark')
const nomenclature = require('../controllers/nomenclature')
const addNewTask = require('../controllers/addNewTask')
const uploads = require('./uploads')
const myTasks = require('../util/myTasks')
const {chosefile} = require('../controllers/getmessage')
const { personnelandhelp } = require('../controllers/menu')
//const params = require('../util/parametrs')
let isContact = false
let idUser = null
let messgeText = ''




bot.on('message', (msg) => {
  const { id } = msg.chat
  if(msg.text === 'Ещё раз загрузить ?'){
    clientbyname.putFile(msg)

  }
  if (msg.text === '/start' || msg.text === '/main') {
    bot.sendMessage(id, `Приветствую, ${msg.from.first_name}`).then(() => {
      userController.setUser(msg)
    })
    return false
  }
  if (msg.text === 'На главную') {
    bot.sendMessage(id, 'Выберите раздел в меню', {
      reply_markup: {
          resize_keyboard: true,
          keyboard: [
              ['Мои задачи'],
              ['Работа с клиентом'],
              ['Номенклатура и остатки'],
              ['Автопарк'],
              ['Поставить задачу'],
              ['Кадры и справки'],
              ['На главную'],
              ['Выйти из приложения']
          ]
      }
  });

  }
  if (
    myTasks.getUserType()[id.toString()] === 'nextstep' &&
    msg.text !== 'Далее'
  ) {
    return false
  }
  if (
    myTasks.getUserType()[id.toString()] === 'role' &&
    msg.text !== '/start'
  ) {
    addNewTask.findRole(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'GetYearsWorker' && msg.text !== '/start') {
    personelHelp.setMoney(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'GetReportSopManufacture' && msg.text !== '/start') {
    nomenclature.getSearchNameManufacture(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'GetMoneyWorker' && msg.text !== '/start') {
    personelHelp.setComment(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'GetCommentworker' && msg.text !== '/start') {
    personelHelp.sendGetMoney(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'fio' && msg.text !== '/start') {
    addNewTask.findName(msg)
    return false
  }
  if (
    myTasks.getUserType()[id.toString()] === 'gettheme' &&
    msg.text !== '/start'
  ) {
    addNewTask.getDescription(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'bin' && msg.text !== '/start') {
    clientswork.getClientByBin(msg)
    return false
  }
  if (
    myTasks.getUserType()[id.toString()] === 'getdescription' &&
    msg.text !== '/start'
  ) {
    addNewTask.getFile(msg)
    return false
  }
  if (
    myTasks.getUserType()[id.toString()] === 'setdate' &&
    msg.text === 'К сроку' &&
    msg.text !== '/start'
  ) {
    addNewTask.customDate(id)
    return false
  }
  if (
      myTasks.getUserType()[id.toString()] === 'oildate' &&
      msg.text === 'К сроку' &&
      msg.text !== '/start'
  ) {
    autopark.customDate(id)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'newcustomdate' && msg.text !== '/start') {
    addNewTask.getCustomDate(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'newcustomdateoil' && msg.text !== '/start') {
    autopark.getCustomDate(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'newcustomdateoil' && msg.text !== '/start') {
    autopark.getCustomDate(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'clientname' && msg.text !== '/start') {
    clientbyname.getClientByName(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'productname' && msg.text !== '/start') {
    nomenclature.getProductByName(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'contractname' && msg.text !== '/start') {
    clientbyname.getContractByNumber(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'sellingtname' && msg.text !== '/start') {
    clientbyname.getSellingByNumber(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'getAutoByNumber' && msg.text !== '/start') {
    autopark.getAutoByNumber(msg)
    return false
  }
  
  if (myTasks.getUserType()[id.toString()] === 'getShippingByNumber' && msg.text !== '/start') {
    nomenclature.getShippingByNumber(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'setOdometAuto' && msg.text !== '/start') {
    autopark.setOdometAuto(msg)
    return false
  }if (myTasks.getUserType()[id.toString()] === 'setOdometFuelAuto' && msg.text !== '/start') {
    autopark.getOdometerAuto2(msg)
    return false
  } 
  if (myTasks.getUserType()[id.toString()] === 'setDocAuto' && msg.text !== '/start') {
    autopark.setDocAuto(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'autoFiles' && msg.text !== '/start') {
    clientbyname.autoFiles(msg) 
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'acceptfiles' && msg.text !== '/start') {
    getFile.acceptfiles(msg) 
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'oilcount' && msg.text !== '/start') {
    autopark.getDesc(msg)
    return false
  }
  if (myTasks.getUserType()[id.toString()] === 'oildeck' && msg.text !== '/start') {
    autopark.getOilDate(msg)
    return false
  }
  if (msg.text === 'Смотреть далее' && myTasks.getUserType()[id.toString()] === 'getProductByName') {
    nomenclature.getProductByCategory1(msg)
    return false
  }
  if (msg.text === 'Далее') {
    addNewTask.setDate(id, null)
    return false
  }
  let tasks = []
  const sendMsg = myTasks.getCbdata()[id]
  if (myTasks.getTasks()[id]) tasks = myTasks.getTasks()[id]
  let taskarr = []
  if (tasks.length > 0) {
    for (let i = 0; i < tasks.length; i++) {
      taskarr.push(tasks[i].task_type)
    }
  }
  if (msg.text === 'Подтвердить') {
    checkUsreController.getCheck(msg)
  }else if (msg.text === 'Кадры и справки') {
    personelHelp.getWorkHelp(msg) 
  }else if (msg.text === 'Отмена') {
    myTasks.setUserType(id, ``);
    autopark.mainQuery(msg)
  }else if(msg.text === 'Подтвердить и закрепить файл/файлы'){
    getFile.FileSends(msg)
  }else if(msg.text === 'Прикрепить показания Одометра'){
    autopark.setOdometrAutoStr(msg)
  }else if(msg.text === 'Зафиксировать показания'){
    clientbyname.autoFiles(msg) 
  }else if (msg.text === 'Ближайшие командировки') {
    personelHelp.getVisit(msg)
  }else if (msg.text === 'Да, продолжаем') {
      autopark.setDocAuto(msg) 
  }else if (msg.text === 'Узнать сумму в подотчете') {
    personelHelp.getSumReport(msg)
  }else if (msg.text === 'Справка с места работы') {
    personelHelp.getWorkDoc(msg)
  }else if (msg.text === 'Количество дней отпуска') {
    personelHelp.getVacation(msg)
  }else if (msg.text === 'Работа с клиентом') {
    clientswork.startClientWork(msg)
  }else if (msg.text === 'Реализации по договору') {
    clientswork.getSellingByContract(msg)
  }else if (msg.text === 'Сформировать акт сверки') {
    clientswork.getSverkaByClient(msg)
  }else if (msg.text === 'Kompra') {
    clientswork.getKompraByClient(msg)
  }else if (msg.text === 'Поиск клиента') {
    clientswork.findClient(msg)
  }else if (msg.text === 'Счет на оплату') {
    clientswork.getInvoiceByContract(msg)
  }else if (msg.text === 'Наименование') {
    clientbyname.findClientByName(msg)
  }else if (msg.text === 'Прикрепить файл') {
    clientbyname.putFile(msg)
  }else if (msg.text === 'Send photo') {
    clientbyname.autoFiles(msg)
  }else if (msg.text === 'Получить файл') {
    clientbyname.getFile(msg)
  }else if (msg.text === 'БИН/ИИН') {
    clientswork.findClientByBin(msg)
  }else if (msg.text === 'Найти договор по номеру') {
    clientbyname.findContractByNumber(msg)
  }else if (msg.text === 'Найти реализацию по номеру') {
    clientbyname.findSellingByNumber(msg)
  }else if (msg.text === 'Список договоров') {
    clientswork.getContractByClient(msg, 0)
  }else if (msg.text === 'Автопарк') {
    autopark.mainQuery(msg)
  }else if (msg.text === 'Найти по гос.номеру') {
    autopark.findAutoByNumber(msg)
  }else if (msg.text === 'Выслать Одометр') {
    autopark.setOdometerAuto(msg)
  }else if (msg.text === 'Акт приема-передачи авто') {
    autopark.getAktAuto(msg)
  }else if (msg.text === 'Акт приема-передачи топливной карты') {
    autopark.getAktCard(msg)
  }else if (msg.text === 'Путевой лист') {
    autopark.getList(msg)
  } else if (msg.text === 'Приложить фото') {
    clientbyname.putFile(msg)
  }else if (msg.text === 'Мои авто') {
    autopark.getMyAuto(msg)
  }else if (msg.text === 'Внести состояние ТС') {
    autopark.getOdometerAuto(msg)
  }else if (msg.text === 'Создать Заявку на ГСМ') {
    autopark.getMyOilCard(msg)
  }else if(msg.text === 'Получить отчет SOP по номенклатура') {
    nomenclature.getReportSopProduct(msg)
  }else if(msg.text === 'Поиск по производителю'){
    nomenclature.getManufacture(msg)
  }else if (msg.text === 'Шаблоны документов') {
    autopark.getDoc(msg)
  }else if (msg.text === 'Отчет по всем производителям') {
    nomenclature.getPlanAllSOPByProduct(msg)
  }else if (msg.text === 'Номенклатура и остатки') {
    nomenclature.mainNomenclature(msg)
  }else if (msg.text === 'Найти перевозку по номеру') {
    nomenclature.findShippingByNumber(msg)
  }else if (msg.text === 'Поиск по наименованию номенклатуры') {
    nomenclature.findProductByName(msg)
  }else if (msg.text === 'Поиск по наименованию') {
    nomenclature.findProductByName(msg)
  }else if (msg.text === 'Поиск по категории') {
    nomenclature.getCategory(msg)
  }else if (msg.text === 'Текущие остатки на складе') {
    nomenclature.getStockAll(msg)
  }else if (msg.text === 'Остатки и доступность товара') {
    nomenclature.leftoverGoods(msg)
  }else if (msg.text === 'По всем складам') {
    nomenclature.getStockByProduct(msg)
  }else if (msg.text === 'По нужному складу') {
    nomenclature.getStocks(msg)
  }else if (msg.text === 'Сертификаты товара') {
    nomenclature.getTypeCertByProduc(msg)
  }else if (msg.text === 'Отправить') {
    addNewTask.sendNewTask(msg.chat.id)
  }else if (msg.text === 'Отправить заявку') {
    autopark.setNeedOil(msg)
  }else if (msg.text === 'Подать заявку на Аванс') {
    personelHelp.setGetMoneyWorker(msg)
  }else if (msg.text === 'Заново подать заявку на Аванс') {
    personelHelp.setGetMoneyWorker(msg)
  }else if(msg.text === 'Прикрепить показатели'){
    getFile.acceptfiles(msg);
    console.log('Accept');
  }else if (msg.text === 'Отменить') {
    addNewTask.notSendNewTask(msg.chat.id)
  } else if (msg.text === 'Поставить задачу') {
    addNewTask.selectType(msg)
  } else if (msg.text === 'Ввести ФИО заново') {
    checkUsreController.deleteFio(msg)
  } else if (msg.text === 'Запросить повторно') {
    checkUsreController.anotherCode(msg)
  } else if (msg.text === 'Выйти из приложения') {
    userController.logOut(msg)
  }else if (msg.text === 'Получить отчет SOP') {
    nomenclature.ReportSop(msg)
  } else if (taskarr.length > 0 && taskarr.includes(msg.text)) {
    for (let i = 0; i < tasks.length; i++) {
      if (msg.text === tasks[i].task_type) {
        getTasksController.getTask(msg, tasks[i].task_type_for_1C)
        messgeText = msg.text
      }
    }
  } else if (msg.text === 'Мои задачи') {
    getTasksController.getTasks(msg)
  } else if (
    sendMsg &&
    (sendMsg[0].split('|')[1].split('*')[1] === '1' ||
      sendMsg[1].split('|')[1].split('*')[1] === '1') &&
    msg.text !== '/start'
  ) {
    getTasksController.sendDesigion(msg)
  } else{
            userController.setUser(msg)
    }
})

bot.on('callback_query', (query) => {
  if(query.data === 'predstavlenie'){
    const pid = query.from.id
    myTasks.sendData();
      bot.sendMessage(pid, global.data, {
         reply_markup: {
             remove_keyboard: true,
             inline_keyboard: [
                 [
                     {
                         text: chosefile, callback_data: 'sendfile'
                     }
                 ]
             ]
         }
     })
     bot.on("polling_error", console.log);
  }
  if(query.data === 'sendfile'){
    const pid = query.from
    clientbyname.putFiles(pid)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getClientByName') {
    clientswork.getClientByGuid(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getProductByName') {
    nomenclature.getProductByGuid(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getFilesCertByGUID') {
    nomenclature.getFilesCertByGUID(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getTypeCertByProduct') {
    nomenclature.getCertByProduct(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getStocks') {
    nomenclature.getStockByProductAndStock(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getStocksAll') {
    nomenclature.getStockByStock(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getManufactureStocks') {
    nomenclature.getReportSopManufacture(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'getCategory') {
    nomenclature.getProductByCategory(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'myoilcard') {
    autopark.getTypeOil(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'oiltype') {
    autopark.getOilCount(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'myauto') {
    autopark.getAutoByGuid(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'sell') {
    clientswork.getSellingByGuid(query.message.chat.id, query.data)
    return false
  }
  if (query.data.split('|')[0] === 'seazons') {
    clientswork.getContractByClient(query.data.split('|')[1]+'|'+query.message.chat.id, 1)
    return false
  }
  if (query.data.split('|')[0] === 'kompra') {
    clientswork.getKompraPDFByGuid(query.data.split('|')[1], query.message.chat.id)
    return false
  }
  if (query.data.split('|')[0] === 'contract') {
    clientswork.getContractByGuid(query.message.chat.id, query.data.split('|')[1])
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'selected') {
    addNewTask.getTaskMessage(query.message.chat.id, query.data)
    return false
  }
  if (myTasks.getUserType()[query.message.chat.id.toString()] === 'selectedclient') {
    clientswork.getClientByGuid(query.message.chat.id, query.data)
    return false
  }
  if (query.message.text === 'Контакты') {
    bot.sendMessage(
      query.message.chat.id,
      'Введите сообщение, голосовое сообщение, прикрепите файл, изображение или видео',
    )
    isContact = true
    idUser = query.data
  } else if (query.data.split('|')[0] === 'setdate') {
    addNewTask.isShure(query.message.chat.id, query.data.split('|')[1])
  } else if (query.data.split('|')[0] === 'setdateoil') {
    autopark.isShure(query.message.chat.id, query.data.split('|')[1])
  } else if (query.data === 'newrole') {
    nomenclature.selectedRole(query.message.chat.id)
  } else if (query.data === 'newfio') {
    addNewTask.selectedName(query.message.chat.id)
  } else if (query.data === 'logout' || query.data === 'back') {
    userController.checkLogOut(query.message.chat.id, query.data)
  } else if (query.message.text === messgeText) {
    getTasksController.getTaskByGuid(query.message.chat.id, query.data)
  } 
  else if (
    myTasks.getTaskResult()[query.message.chat.id].includes(query.data)
  ) {
    console.log(myTasks.getTaskResult()[query.message.chat.id].includes(query.data))
    getTasksController.setTaskResults(query.message.chat.id, query.data)
  } 
  else if (query.data === 'getcard') {
    console.log(query.message.chat.id)
    console.log(myTasks.getTasksData()[query.message.chat.id])
    getTasksController.getPdfFile(query.message.chat.id, myTasks.getTasksData()[query.message.chat.id])
  }
})
