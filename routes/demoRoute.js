const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(demoController.get));
router.post('/',  catchErrors(demoController.post));
router.delete('/', catchErrors(demoController.delete));

module.exports = router;
