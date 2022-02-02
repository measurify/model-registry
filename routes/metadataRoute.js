const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(metadataController.get));
router.post('/', catchErrors(metadataController.post));
router.delete('/:id',  catchErrors(metadataController.delete));

module.exports = router;