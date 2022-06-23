const db = require('../util/database');


module.exports = class NewTask{
    static getOnecusersByNane(name){
        return db.execute(`SELECT showing, guid, objectname, objecttype, prefics FROM onecusers where showing like '%${name}%'`);
    }
    static getRolesByNane(name){
        return db.execute(`SELECT showing, guid, objectname, objecttype, prefics FROM roles where showing like '%${name}%'`);
    }
    static getUserByGuid(guid){
        return db.execute(`SELECT showing, objectname, objecttype, prefics FROM onecusers where guid like '${guid}'`);
    }
    static getRoleByGuid(guid){
        return db.execute(`SELECT showing, objectname, objecttype, prefics FROM roles where guid like '${guid}'`);
    }
}