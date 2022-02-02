const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(tagController.get));
router.post('/', catchErrors(tagController.post));
router.delete('/:id',  catchErrors(tagController.delete));

module.exports = router;