const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController.js');
const versionController = require('../controllers/versionController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

const multer  = require('multer');
const upload = multer({ dest: process.env.UPLOAD_PATH })

router.get('/',  catchErrors(modelController.get));
router.get('/:id', catchErrors(modelController.getone));
router.post('/', catchErrors(modelController.post));
router.delete('/:id',  catchErrors(modelController.delete));
router.put('/:id',  catchErrors(modelController.put));
router.get('/:id/versions/:original', catchErrors(versionController.get));
router.post('/:id/versions', upload.single('file'), catchErrors(versionController.post));
router.delete('/:id/versions/:original', catchErrors(versionController.delete));


module.exports = router;
