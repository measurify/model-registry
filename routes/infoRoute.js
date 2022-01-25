const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(infoController.get));

module.exports = router;
