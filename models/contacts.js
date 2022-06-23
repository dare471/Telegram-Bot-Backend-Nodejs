const db = require('../util/database');

module.exports = class Contact{
    static getAllContacts(){
        return db.execute(`SELECT id_telegram, onec_name FROM users`);
    }
    static getContact(id){
        return db.execute(`SELECT onec_name FROM users WHERE id_telegram=${id}`);
    }
};