#!/bin/bash

path_s=`pwd`
cd $path_s"/controllers"
function run() {
    node checkNewRolesAndUsers.js
}
run
