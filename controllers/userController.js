const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const email = require('../commons/email.js');
const messages = require('../commons/messages.js');
const authorizator = require('../security/authorization.js');
const { select } = require('underscore');
const bcrypt = require('bcryptjs');
const { passwordStrength } = require('check-password-strength');
const errors = require('../commons/errors.js');
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes.js'); 
const ObjectId = require('mongoose').Types.ObjectId;


exports.get = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const result = authorizator.isAdministrator(req.user); let select = result === true ? [] : ["_id", "username"];
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, User);
};

exports.getone = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = authorizator.isAdministrator(req.user); let select = result === true ? [] : ["_id", "username"];
    return await controller.getResource(req, res, null, User, select);
};

exports.post = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAdministrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, User);
};

exports.put = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const fields = ['email','password'];
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
    result = await checker.isAdministrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Model, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Dataset, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'owner'); if (result != true) return result;
    return await controller.deleteResource(req, res, User);
};

exports.reset = async (req, res) => {
    if(!req.query.tenant) return errors.manage(res, errors.get_request_error, "Query param `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.query.tenant);
    if(!tenant) return errors.manage(res, errors.post_request_error, "Unknown tenant (" + req.query.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    const PasswordReset = mongoose.dbs[tenant.database].model('PasswordReset');
    if(!req.body.email) return errors.manage(res, errors.missing_email);
    const user = await User.findOne({email: req.body.email});
    if(!user) return errors.manage(res, errors.resource_not_found);
    const request = { user: user._id, status: PasswordResetStatusTypes.valid , created: Date.now() };
    const reset = await (new PasswordReset(request)).save();
    const url = req.protocol + '://' + req.get('host')
    await email.send(messages.reset(url, user, reset._id));
    return res.status(200).json({message: 'request sent'}); 
};

exports.password = async (req, res) => {
    if(!req.body.tenant) return errors.manage(res, errors.get_request_error, "Body param `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.body.tenant);
    if(!tenant) return errors.manage(res, errors.get_request_error, "Unknown tenant (" + req.body.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    const PasswordReset = mongoose.dbs[tenant.database].model('PasswordReset');
    if(!req.body.password) return errors.manage(res, errors.missing_info, "Body param `password` is required");
    if(!req.body.reset) return errors.manage(res, errors.missing_info, "Body param `reset` is required");
    if(!ObjectId.isValid(req.body.reset)) return errors.manage(res, errors.resource_not_found, req.body.reset);
    const reset = await PasswordReset.findById(req.body.reset);
    if(!reset) return errors.manage(res, errors.resource_not_found, req.body.reset);
    if(reset.status == PasswordResetStatusTypes.invalid) return errors.manage(res, errors.reset_invalid, req.body.reset);
    const user = await User.findById(reset.user);
    if(!user) return errors.manage(res, errors.resource_not_found, 'user');
    const reset_updated = await PasswordReset.findByIdAndUpdate(req.body.reset, { "$set": { "status": PasswordResetStatusTypes.invalid } });   
    if(!isPasswordStrongEnough(req.body.password))return errors.manage(res, errors.get_request_error, "The password strength is too weak, make a new request to reset password and choose a stronger password");        
    if(tenant.passwordhash == true || tenant.passwordhash == 'true') req.body.password = bcrypt.hashSync(req.body.password, 8);
    const user_updated = await User.findByIdAndUpdate(user._id, { "$set": { "password": req.body.password, "createdPassword":Date.now() },  });
    return res.status(200).json(user_updated);   
};

const isPasswordStrongEnough = function (password) {
    const details = passwordStrength(password);
    return details.id >= process.env.MIN_PASSWORD_STRENGTH;
}
