const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');
const filemanager = require('../commons/filemanager.js');

const authorizator = require('../security/authorization.js');

exports.get = async (req, res) => {
    let model = mongoose.dbs[req.tenant.database].model('Model');
    if(req.originalUrl.includes('datasets')) model = mongoose.dbs[req.tenant.database].model('Dataset');
    if(req.originalUrl.includes('algorithms')) model = mongoose.dbs[req.tenant.database].model('Algorithm');
    let result = await checker.isAvailable(req, res, model); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.isContained(req, res, 'versions', 'ordinal', req.params.ordinal); if (result != true) return result;
    return await filemanager.download(req, res);
};

exports.post = async (req, res) => {
    if(!req.file) return errors.manage(res, errors.post_request_error, "Missing file");
    let model = mongoose.dbs[req.tenant.database].model('Model');
    if(req.originalUrl.includes('datasets')) model = mongoose.dbs[req.tenant.database].model('Dataset');
    if(req.originalUrl.includes('algorithms')) model = mongoose.dbs[req.tenant.database].model('Algorithm');
    let result = await checker.isAvailable(req, res, model); if (result != true) { await filemanager.delete(req.file.filename); return result };
    result = await checker.canModify(req, res); if (result != true) { await filemanager.delete(req.file.filename); return result };
    //result = await checker.isAlreadyContained(req, res, 'versions', 'ordinal', req.file.originalname); if (result != true) { await filemanager.delete(req.file.filename); return result };
    result = await checker.createOrdinal(req,res); if (result != true)  { await filemanager.delete(req.file.filename); return result };
    req.body = { versions: { add: [ { ordinal:req.ordinal, key: req.file.filename, original: req.file.originalname, encoding: req.file.encoding, mimetype: req.file.mimetype, size: req.file.size } ] } }  
    return await controller.updateResource(req, res, ['versions'], model);
};

exports.delete = async (req, res) => {
    let model = mongoose.dbs[req.tenant.database].model('Model');
    if(req.originalUrl.includes('datasets')) model = mongoose.dbs[req.tenant.database].model('Dataset');
    if(req.originalUrl.includes('algorithms')) model = mongoose.dbs[req.tenant.database].model('Algorithm');
    let result = await checker.isAvailable(req, res, model); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.isContained(req, res, 'versions', 'ordinal', req.params.ordinal); if (result != true) return result;
    await filemanager.delete(req.element.key);
    req.body = { versions: { remove: [ { ordinal: req.params.ordinal } ] } } 
    return await controller.updateResource(req, res, ['versions'], model);
};