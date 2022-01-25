const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

exports.get = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Tag, null);
};

exports.getone = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    return await controller.getResource(req, res, null, Tag, null);
};

exports.post = async (req, res) => {
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Tag);
};

exports.delete = async (req, res) => {
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Model, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Dataset, 'tags'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Tag);
};

