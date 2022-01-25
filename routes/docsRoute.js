const express = require('express');
const router = express.Router();
const docsController = require('../controllers/docsController');
const { catchErrors } = require('../commons/errorHandlers');

router.get('/',  catchErrors(docsController.get));

module.exports = router;