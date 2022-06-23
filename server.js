const express = require('express');
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");
const notificationRouter = require('./routes/notification');
const port = process.env.PORT || 7777;
const path = require('path');
const app = express();

app.use(function (req, res, next) {
    res.header('X-powered-by', 'Blood, sweat, and tears')
    res.header('Cache-Control', 'no-cache')
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use('/api', bodyParser.json(), notificationRouter);

app.use(serveStatic(path.join(__dirname, 'dist')));

app.listen(port);