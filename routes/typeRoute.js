const express = require('express');
const router = express.Router();
const typesController = require('../controllers/typesController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(typesController.get));
router.get('/passwordStrength',  catchErrors(typesController.getPasswordStrength));
router.get('/tenants',  catchErrors(typesController.getTenantNames));

module.exports = router;
