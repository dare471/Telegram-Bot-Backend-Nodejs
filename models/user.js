const db = require('../util/database');

module.exports = class User{

    static FileUser(id, name){
        return db.execute(`INSERT INTO file_users (telegram_id, file_name) 
        VALUES ( ${id}, '${name}')`);
    }

    static ListFileUser(id){
        return db.execute(`SELECT file_name FROM file_users where telegram_id = ${id}`);
    }

    static ListTruncate(id){
        return db.execute(`DELETE from file_users WHERE telegram_id =${id}`);
    }

    static getAllUsersBotId(){
        return db.execute(`SELECT id_telegram FROM users`);
    }

    static getUserOnecname(id){
        return db.execute(`SELECT onec_name, checked, registred FROM users WHERE id_telegram=${id}`);
    }

    static setUserOnecname(name, id){
        return db.execute(`UPDATE users SET onec_name='${name}' WHERE id_telegram=${id}`);
    }

    static setRegistred(id){
        return db.execute(`UPDATE users SET registred=1 WHERE id_telegram=${id}`);
    }

    static setUserOnecnameNull(id){
        return db.execute(`UPDATE users SET onec_name=null, checked=0 WHERE id_telegram=${id}`);
    }

    static setUserChecked(id, check){
        return db.execute(`UPDATE users SET checked=${check} WHERE id_telegram=${id}`);
    }

    static newUser(id, first, last){
        return db.execute(`INSERT INTO users (id_telegram, first_name) 
        VALUES ( ${id}, '${first}')`);
    }

    static deleteUser(id){
        return db.execute(`DELETE FROM users WHERE id_telegram=${id}`);
    }
};

