const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    if(!req.tenant||req.tenant._id!==process.env.DEFAULT_TENANT_DEMO){return errors.manage(res, errors.demo_tenant_required)};   
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.restricted_access_read); 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    const users = await User.find({});
    const tags = await Tag.find({});
    const metadata = await Metadata.find({});
    const datasets = await Dataset.find({});
    const models = await Model.find({});  
    res.status(200).json({users: users, tags: tags, metadata: metadata, datasets: datasets, models: models });
};

exports.post = async (req, res) => {    
    if(!req.tenant||req.tenant._id!==process.env.DEFAULT_TENANT_DEMO){return errors.manage(res, errors.demo_tenant_required)}; 
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.restricted_access_read); 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Model = mongoose.dbs[req.tenant.database].model('Model');
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Dataset = mongoose.dbs[req.tenant.database].model('Dataset');
    let models = await Model.find({});
    if(models.length == 0) await factory.createDemoContent(req.tenant); 
    const users = await User.find({});
    const tags = await Tag.find({});
    const metadata = await Metadata.find({});
    const datasets = await Dataset.find({});
    models = await Model.find({});
    res.status(200).json({users: users, tags: tags, metadata: metadata, datasets: datasets, models: models });
};

exports.delete = async (req, res) => {    
    if(!req.tenant||req.tenant._id!==process.env.DEFAULT_TENANT_DEMO){return errors.manage(res, errors.demo_tenant_required)}; 
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.restricted_access_read); 
    await factory.dropContents(req.tenant);
    res.status(200).json({ok: true});
};
