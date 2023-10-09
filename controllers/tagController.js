const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const UsageTypes = require('../types/usageTypes.js');

exports.get = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Tag, null);
};

exports.post = async (req, res) => {
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    let result = await checker.isAdministrator(req, res); if (result != true) return result;
    if(!req.body.usage) req.body.usage = UsageTypes.default;
    return await controller.postResource(req, res, Tag);
};

exports.delete = async (req, res) => {            
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const Algorithm = mongoose.dbs[req.tenant.database].model('Algorithm');    
    const Model = mongoose.dbs[req.tenant.database].model('Model');    
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isAdministrator(req, res); if (result != true) return result;    
    result = await checker.isNotUsed(req, res, Model, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Algorithm, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Dataset, 'tags'); if (result != true) return result;
    return await controller.deleteResource(req, res, Tag);
};

