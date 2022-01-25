const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const restrictions = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Model, restrictions); 
};

exports.getone = async (req, res) => { 
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    let result = await checker.isAvailable(req, res, Model); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Model, null);
};

exports.post = async (req, res) => {
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Model);
};

exports.put = async (req, res) => { 
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const fields = ['users', 'status', 'metadata', 'tags', 'visibility', 'datasets'];
    let result = await checker.isAvailable(req, res, Model); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Model);
};   

exports.delete = async (req, res) => {
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    let result = await checker.isAvailable(req, res, Model); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Model);
};
