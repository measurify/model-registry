const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const { catchErrors } = require('../commons/errorHandlers');

router.get('/',  catchErrors(errorController.get));

module.exports = router;