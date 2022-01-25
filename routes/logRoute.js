const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(logController.get));

module.exports = router;
