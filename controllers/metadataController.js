const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const UsageTypes = require('../types/usageTypes.js');

exports.get = async (req, res) => { 
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Metadata, null);
};

exports.post = async (req, res) => {
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    if(!req.body.usage) req.body.usage = UsageTypes.default;
    return await controller.postResource(req, res, Metadata);
};


exports.delete = async (req, res) => {
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    let result = await checker.isAvailable(req, res, Metadata); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Metadata);
};
