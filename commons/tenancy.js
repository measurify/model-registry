const mongoose = require('mongoose');
const fs = require('fs');
const factory = require('./factory.js');  
const bcrypt = require('bcryptjs');
const UserRoles = require('../types/userRoles');

const init = async function(tenant, username, password) {
    const passwordhash = tenant.passwordhash;
    if(!username) username = process.env.DEFAULT_TENANT_ADMIN_USERNAME;
    if(!password) password = process.env.DEFAULT_TENANT_ADMIN_TEMPORARY_PASSWORD;
    if(!tenant.database) { tenant.database = tenant._id;  await tenant.save(); }
    mongoose.dbs[tenant.database] = await mongoose.dbs['catalog'].useDb(tenant.database);
    const models = await fs.readdirSync('./models/');
    for(let i=0; i<models.length; i++) {
        if(models[i] == "tenantSchema.js") continue;
        if(models[i] == "logSchema.js") continue;
        const model_schema = require('../models/' + models[i]);
        const model_name = models[i].substring(0, 1).toUpperCase() + models[i].substring(1, models[i].length - 9);
        await mongoose.dbs[tenant.database].model(model_name, model_schema);
    };  
    const User = mongoose.dbs[tenant.database].model('User'); 
    let user = await User.findOne();
    if(!user) await factory.createUser(username, password, UserRoles.admin, tenant);      
};

const create = async function(id) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let tenant = await Tenant.findById(id);
    if(!tenant) { 
        const req = { _id: id, database: process.env.DEFAULT_TENANT_DATABASE };
        tenant = new Tenant(req);
        await tenant.save();
        await init(tenant);     
    } 
    return tenant;
}

exports.getList = async function() {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    await create(process.env.DEFAULT_TENANT);
    return await Tenant.find({});
};

exports.init = init;
