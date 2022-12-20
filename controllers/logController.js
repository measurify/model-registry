const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Log = mongoose.dbs['catalog'].model('Log');
    const result = await checker.isAdministrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "date": "desc" }', null, Log); 
};

