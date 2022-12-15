const express = require('express');
const router = express.Router();
const algorithmController = require('../controllers/algorithmController.js');
const versionController = require('../controllers/versionController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

const multer  = require('multer');
const upload = multer({ dest: process.env.UPLOAD_PATH })

router.get('/',  catchErrors(algorithmController.get));
router.get('/:id', catchErrors(algorithmController.getone));
router.post('/', catchErrors(algorithmController.post));
router.delete('/:id',  catchErrors(algorithmController.delete));
router.put('/:id',  catchErrors(algorithmController.put));
router.get('/:id/versions/:ordinal', catchErrors(versionController.get));
router.post('/:id/versions', upload.single('file'), catchErrors(versionController.post));
router.delete('/:id/versions/:ordinal', catchErrors(versionController.delete));


module.exports = router;
