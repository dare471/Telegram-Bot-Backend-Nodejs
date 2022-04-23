#!/bin/bash
ret=$(netstat -pnat | grep 7777 | wc -l)
if [ "$ret" -eq 0 ]
then {
cd  /home/Telegram-Bot-Backend-Nodejs
/root/.nvm/versions/node/v10.21.0/bin/node server.js &
exit 1
}
else
{
exit 1
}
fi;
