const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');

exports.get = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, User); 
};

exports.getone = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, User, null);
};

exports.post = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, User);
};

exports.put = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const fields = ['password'];
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isHim(req, res); if (result != true) return result; 
    return await controller.updateResource(req, res, fields, User);
};  

exports.delete = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Model, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Dataset, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'owner'); if (result != true) return result;
    return await controller.deleteResource(req, res, User);
};
