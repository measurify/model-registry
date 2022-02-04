const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

const jwt = require('jsonwebtoken');
const passport = require('passport');

router.post('/',  catchErrors(loginController.post));
router.put('/', catchErrors(loginController.put));

module.exports = router;
