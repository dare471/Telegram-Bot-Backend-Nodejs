const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const getTaskController = require('../controllers/getTaskNotif');

router.post('/notification', notificationController.setNotification);
router.post('/gettasktotif', getTaskController.getTaskNotif);

module.exports = router;