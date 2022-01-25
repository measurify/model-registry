const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Tenant, null); 
};

exports.getone = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    return await controller.getResource(req, res, null, Tenant, null);
};

exports.post = async (req, res) => {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    return await controller.postResource(req, res, Tenant);
};

exports.put = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const fields = ['organization', 'address', 'email', 'phone']
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Tenant);
};   

exports.delete = async (req, res) => {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    return await controller.deleteResource(req, res, Tenant);
};
