const db = require('../util/database');

module.exports = class NewTaskTables{
    static getAllOnecusers(){
        return db.execute(`SELECT showing, guid, objectname, objecttype, prefics FROM onecusers ORDER BY 'id'`);
    }
    static getAllRoles(){
        return db.execute(`SELECT showing, guid, objectname, objecttype, prefics FROM roles ORDER BY 'id'`);
    }
    static getCountOnecusers(){
        return db.execute(`SELECT COUNT(*) as count FROM onecusers`);
    }
    static getCountRoles(){
        return db.execute(`SELECT COUNT(*) as count FROM roles`);
    }
    static setOnecuser(showing, guid, objectname, objecttype, prefics){
        return db.execute(`INSERT INTO onecusers (showing, guid, objectname, objecttype, prefics) 
        VALUES ( '${showing}', '${guid}', '${objectname}', '${objecttype}', '${prefics}')`);
    }
    static setRole(showing, guid, objectname, objecttype, prefics){
        return db.execute(`INSERT INTO roles (showing, guid, objectname, objecttype, prefics) 
        VALUES ( '${showing}', '${guid}', '${objectname}', '${objecttype}', '${prefics}')`);
    }
    static deleteRoleTab(){
        return db.execute('DROP TABLE IF EXISTS roles');
    }
    static deleteUserTab(){
        return db.execute('DROP TABLE IF EXISTS onecusers');
    }
    static createRoleTab(){
        return db.execute('CREATE TABLE `roles` (\n' +
            '  `id` INT NOT NULL AUTO_INCREMENT,\n' +
            '  `showing` VARCHAR(200) NOT NULL,\n' +
            '  `guid` VARCHAR(100) NOT NULL,\n' +
            '  `objectname` VARCHAR(45) NOT NULL DEFAULT \'РолиИсполнителей\',\n' +
            '  `objecttype` VARCHAR(45) NOT NULL DEFAULT \'Справочники\',\n' +
            '  `prefics` VARCHAR(45) NOT NULL DEFAULT \'Catalog\',\n' +
            '  PRIMARY KEY (`id`),\n' +
            '  UNIQUE INDEX `guid_UNIQUE` (`guid` ASC))');
    }
    static createUserTab(){
        return db.execute('CREATE TABLE `onecusers` (\n' +
            '  `id` INT NOT NULL AUTO_INCREMENT,\n' +
            '  `showing` VARCHAR(200) NOT NULL,\n' +
            '  `guid` VARCHAR(100) NOT NULL,\n' +
            '  `objectname` VARCHAR(45) NOT NULL DEFAULT \'РолиИсполнителей\',\n' +
            '  `objecttype` VARCHAR(45) NOT NULL DEFAULT \'Справочники\',\n' +
            '  `prefics` VARCHAR(45) NOT NULL DEFAULT \'Catalog\',\n' +
            '  PRIMARY KEY (`id`),\n' +
            '  UNIQUE INDEX `guid_UNIQUE` (`guid` ASC))');
    }
}