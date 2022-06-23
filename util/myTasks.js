let tasks = {};
let taskwithguid = {};
let self = {};
let taskResult = {};
let taskdata = {};
let cb_data = {};
let task_type = {};
let usertype = {};
let setnewtask = {};
let ext = {}
let clientdata = {}
let allproducts = {}
let counter = {}
let FileData = {};
let data = {}
let description = {}

exports.setCounter = (id, type = null) => {
    counter[id] = type;
};

exports.getCounter = () => {
    return counter
};

exports.setAllproducts = (id, type = null) => {
    allproducts[id] = type;
};

exports.getAllproducts = () => {
    return allproducts
};

exports.setClientData = (id, type = null) => {
    clientdata[id] = type;
};

exports.getClientData = () => {
    return clientdata
};

exports.setExt = (id, type = null) => {
    ext[id] = type;
};

exports.getExt = () => {
    return ext
};

exports.setNewTask = (id, array) => {
    setnewtask[id] = array;
};

exports.getNewTask = () => {
    return setnewtask
};

exports.setUserType = (id, type = null) => {
    usertype[id] = type;
};

exports.setUserBody = (id, body) => {
    return id,body
};

exports.getUserType = () => {
    return usertype
};

exports.setTaskType = (id, array) => {
    task_type[id] = array;
};

exports.getTaskType = () => {
    return task_type
};

exports.setTasks = (id, array) => {
  tasks[id] = array;
};

exports.getTasks = () => {
    return tasks
};

exports.getData = (array) => {
    global.data = array;
};

exports.sendData = () => {
    return global.data;
};

exports.setTasksData = (id, array) => {
    taskdata[id] = array;
};

exports.getTasksData = () => {
    return taskdata
};

exports.setFileData = (id, array) => {
    FileData[id] = array; 
};

exports.getFileData = () => {
    return FileData;
};

exports.setTaskWithGuid = (id, array) => {
    taskwithguid[id] = array;
};

exports.GetTaskWithGuid = () => {
    return taskwithguid
};

exports.setSelf = (id, array) => {
    self[id] = array;
};

exports.getSelf = () => {
    return self
};

exports.setTaskResult = (id, array) => {
    taskResult[id] = array;
};

exports.getTaskResult = () => {
    return taskResult
};

exports.getDescriptionDoc = () => {
    return taskResult
};

exports.setCbdata = (id, array) => {
    cb_data[id] = array;
};

exports.getCbdata = () => {
    return cb_data
};