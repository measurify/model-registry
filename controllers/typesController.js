const fs = require('fs');
const controller = require('./controller');
const mongoose = require('mongoose');

exports.get = async (req, res) => { 
    const types = {};
    const types_files = await fs.readdirSync('./types/');
    for(let i=0; i<types_files.length; i++) {
        const type = require('../types/' + types_files[i]);
        const type_name = types_files[i].substring(0, 1).toUpperCase() + types_files[i].substring(1, types_files[i].length - 3);
        types[type_name] = type;
    }
    return res.status(200).json(types);    
};

exports.getPasswordStrength = async (req, res) => {
    const passwordStrength = {passwordStrength:  process.env.MIN_PASSWORD_STRENGTH, ValidityPasswordDays:process.env.DEFAULT_DAYS_VALIDITY_PASSWORD};
    res.status(200).json(passwordStrength);
};

exports.getTenantNames = async (req, res) => {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    req.query.limit=1000;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', ["_id"], Tenant, null);     
};


