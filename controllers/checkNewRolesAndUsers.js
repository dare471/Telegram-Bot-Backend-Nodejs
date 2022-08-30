const UsersAndRoles = require('../models/newTaskTablesModel');
const axios = require('axios');
const config = require('../util/config');

let ROLE = [];
let USERS = [];
let ROLEFORSTRING = 0;
let ROLEFORSTRINGDB = ''
let USERSFORSTRING = 0
let USERSFORSTRINGDB = ''

const getRoleAndUsers = async() => {
    let { id } = msg.from
    let command = `?command=getUserAndGroup&id_telegram=` + id
    await axios.post(`${config.ONE_C_URL + command}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: config.ONE_C_AUTH_LOGIN,
            password: config.ONE_C_AUTH_PASSWORD
        }
    })
        .then(res => {
            USERS = res.data.Users;
            ROLE = res.data.Groups;
            console.log("test", res.data)
            let arrRole = []
            let arrUsr = []
            for (let i = 0; i < ROLE.length; i++){
                arrRole.push({"showing":ROLE[i].Представление, "guid":ROLE[i].guid, "objectname":ROLE[i].ИмяОбъекта, "objecttype":ROLE[i].ТипОбъекта, "prefics":ROLE[i].prefics});
            }
            for (let i = 0; i < USERS.length; i++){
                arrUsr.push({"showing":USERS[i].Представление, "guid":USERS[i].guid, "objectname":USERS[i].ИмяОбъекта, "objecttype":USERS[i].ТипОбъекта, "prefics":USERS[i].prefics});
            }
            ROLEFORSTRING = JSON.stringify(arrRole).length;
            USERSFORSTRING = JSON.stringify(arrUsr).length;
            getRoleAndUsersFromDb()
        }).catch(e => {
            console.log(e.message);
        });
}
getRoleAndUsers()
const getRoleAndUsersFromDb = () => {
    UsersAndRoles.getAllRoles().then(([rows]) => {
        ROLEFORSTRINGDB = JSON.stringify(rows);
        if(ROLEFORSTRINGDB.length !== ROLEFORSTRING){
            setRoles();
        }
    })
    .catch(e => {
        console.log(e.message);
    });
    UsersAndRoles.getAllOnecusers().then(([rows]) => {
        USERSFORSTRINGDB = JSON.stringify(rows);
        if(USERSFORSTRINGDB.length !== USERSFORSTRING){
            setUsers()
        }
    })
        .catch(e => {
            console.log(e.message);
        });
}

const setRoles = () => {
        UsersAndRoles.deleteRoleTab()
            .then(() => {
                UsersAndRoles.createRoleTab()
                    .then(() => {
                        for(let i = 0; i < ROLE.length; i++){
                            UsersAndRoles.setRole(ROLE[i].Представление, ROLE[i].GUID, ROLE[i].ИмяОбъекта, ROLE[i].ТипОбъекта, ROLE[i].prefics)
                        }
                })
            })
}
const setUsers = () => {
    UsersAndRoles.deleteUserTab()
        .then(() => {
            UsersAndRoles.createUserTab()
                .then(() => {
                    for(let i = 0; i < USERS.length; i++){
                        UsersAndRoles.setOnecuser(USERS[i].Представление, USERS[i].GUID, USERS[i].ИмяОбъекта, USERS[i].ТипОбъекта, USERS[i].prefics)
                    }
                })
        })
}