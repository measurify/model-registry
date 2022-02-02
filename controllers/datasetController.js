const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');
const folksonomy = require('./folksonomy.js');

exports.get = async (req, res) => { 
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const restrictions = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Dataset, restrictions); 
};

exports.getone = async (req, res) => { 
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    let result = await checker.isAvailable(req, res, Dataset); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Dataset, null);
};

exports.post = async (req, res) => {
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await folksonomy.addTags(req, res); if (result != true) return result;
    result = await folksonomy.addMetadata(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Dataset);
};

exports.put = async (req, res) => { 
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const fields = ['users', 'metadata', 'tags', 'visibility'];
    let result = await checker.isAvailable(req, res, Dataset); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await folksonomy.addTags(req, res); if (result != true) return result;
    result = await folksonomy.addMetadata(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Dataset);
};   

exports.delete = async (req, res) => {
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    let result = await checker.isAvailable(req, res, Dataset); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Model, 'datasets'); if (result != true) return result;
    return await controller.deleteResource(req, res, Dataset);
};
