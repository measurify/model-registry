const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController.js');
const versionController = require('../controllers/versionController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

const multer  = require('multer');
const upload = multer({ dest: process.env.UPLOAD_PATH })

router.get('/',  catchErrors(datasetController.get));
router.get('/:id', catchErrors(datasetController.getone));
router.post('/', catchErrors(datasetController.post));
router.delete('/:id',  catchErrors(datasetController.delete));
router.put('/:id',  catchErrors(datasetController.put));
router.get('/:id/versions/:original', catchErrors(versionController.get));
router.post('/:id/versions', upload.single('file'), catchErrors(versionController.post));
router.delete('/:id/versions/:original', catchErrors(versionController.delete));

module.exports = router;
