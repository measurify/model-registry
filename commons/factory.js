const crypto = require("crypto");
const mongoose = require('mongoose');
const tenancy = require('./tenancy.js');
const authentication = require('../security/authentication.js');
const bcrypt = require('bcryptjs');

const UserRoles = require('../types/userRoles');
const ModelStatusTypes = require('../types/modelStatusTypes.js'); 
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const UsageTypes = require('../types/usageTypes.js'); 

const { versions } = require('process');

exports.uuid = function() {  return crypto.randomBytes(16).toString("hex"); }

exports.random = function(max) { return Math.floor(Math.random() * max); }

exports.dropContents = async function(tenant){  
    try{
        const Tenant = mongoose.dbs['catalog'].model('Tenant');  
        if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
        for (let collection in mongoose.dbs[tenant.database].collections) { await mongoose.dbs[tenant.database].collections[collection].deleteMany(); };  
        await tenancy.init(tenant);   
    }
    catch (error) { console.log('Error in dropping databae ' + tenant + '('+ error + ')')} 
}

exports.getAdminToken = async function(tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const User = mongoose.dbs[tenant.database].model('User');
    const admin = await User.findOne({ username: process.env.DEFAULT_TENANT_ADMIN_USERNAME });
    return authentication.encode(admin, tenant);
};

exports.getUserToken = async function(user, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    return authentication.encode(user, tenant);
};

exports.createTenant = async function(id, organization, address, email, phone, admin_username, admin_password) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let tenant = await Tenant.findOne( { _id: id });
    if(!tenant) {
        const req = { 
            _id: id || uuid(),
            database: id,
            organization: organization ||  uuid(),
            address: address,
            email: email,
            phone: phone,
            admin_username: admin_username,
            admin_password: admin_password
        };
        tenant = new Tenant(req);
        await tenant.save();
    }
    await tenancy.init(tenant);
    return await Tenant.findById(tenant._id);
};

exports.createUser = async function(username, password, role, tenant) {
    if(role) if(!Object.values(UserRoles).includes(role)) throw new Error('Unrecognized role');
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    if(tenant.passwordhash == true || tenant.passwordhash == 'true') { password = bcrypt.hashSync(password, 8); }
    const User = mongoose.dbs[tenant.database].model('User');
    let user = await User.findOne( { username: username });
    if(!user) {
        const req = { 
            username: username,
            password: password,
            role: role || UserRoles.regular 
        };
        user = new User(req);
        await user.save();
    }
    return await User.findById(user._id);
};

exports.createTag = async function(name, owner, usage, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Tag = mongoose.dbs[tenant.database].model('Tag');
    let tag = await Tag.findOne( { _id: name });
    if(!tag) {
        const req = { _id: name, usage: usage, owner: owner}
        tag = new Tag(req);
        await tag.save();
    }
    return tag._doc;
};

exports.createTags = async function(tags, owner, usage, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    if(!tags) return;
    if(Array.isArray(tags)) for(tag of tags) { this.createTag(tag, owner, usage, tenant) }
    else { this.createTag(tags, owner, usage, tenant) }
    return;
};

exports.createMetadata = async function(name, owner, usage, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Metadata = mongoose.dbs[tenant.database].model('Metadata');
    let metadata = await Metadata.findOne( { _id: name });
    if(!metadata) {
        const req = { _id: name, usage: usage, owner: owner}
        metadata = new Metadata(req);
        await metadata.save();
    }
    return metadata._doc;
};

exports.createMetadatas = async function(metadatas, owner, usage, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    if(!metadatas) return;
    if(Array.isArray(metadatas)) for(data of metadatas) { this.createMetadata(data.name, owner, usage, tenant) }
    else { this.createMetadata(metadatas.name, owner, usage, tenant) }
    return;
};

exports.valorizeMetadata = async function(name, value) {
    return { name: name, value: value};
};

exports.createVersion = async function(key, original) {
    return { key: key, original: original, encoding: "ecoding", mimetype: "mimetype", size: 1000};
};
  
exports.createModel = async function(name, owner, users, datasets, versions, status, metadata, visibility, tags, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Model = mongoose.dbs[tenant.database].model('Model');
    const req = { 
        name: name,
        owner: owner,
        users: users || [],
        datasets: datasets || [],
        versions: versions || [],
        status: status || ModelStatusTypes.training,
        metadata: metadata || [],
        visibility: visibility || VisibilityTypes.public,
        tags: tags || []
    }
    const model = new Model(req);
    await model.save();
    this.createTags(tags, owner, UsageTypes.folk, tenant);
    this.createMetadatas(metadata, owner, UsageTypes.folk, tenant);
    return model._doc;
};

exports.createDataset = async function(name, owner, users, versions, metadata, visibility, tags, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Dataset = mongoose.dbs[tenant.database].model('Dataset');
    const req = { 
        name: name,
        owner: owner,
        users: users || [],
        versions: versions || [],
        metadata: metadata || [],
        visibility: visibility || VisibilityTypes.public,
        tags: tags || []
    }
    const dataset = new Dataset(req);
    await dataset.save();
    this.createTags(tags, owner, UsageTypes.folk, tenant);
    this.createMetadatas(metadata, owner, UsageTypes.folk, tenant);
    return dataset._doc;
};

exports.createDemoContent = async function(tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);

    const users = [];
    users.push(await this.createUser('user-1', 'password', UserRoles.regular, tenant));
    users.push(await this.createUser('user-2', 'password', UserRoles.regular, tenant));
    users.push(await this.createUser('user-3', 'password', UserRoles.regular, tenant));
    users.push(await this.createUser('user-4', 'password', UserRoles.regular, tenant));
    users.push(await this.createUser('user-5', 'password', UserRoles.regular, tenant));

    const tags = [];
    tags.push(await this.createTag('tag_1', users[0], UsageTypes.default, tenant));
    tags.push(await this.createTag('tag_2', users[1], UsageTypes.default, tenant));
    tags.push(await this.createTag('tag_3', users[2], UsageTypes.default, tenant));

    const metadatas = [];
    metadatas.push(await this.createMetadata('name_1', users[0], UsageTypes.default, tenant));
    metadatas.push(await this.createMetadata('name_2', users[1], UsageTypes.default, tenant));
    metadatas.push(await this.createMetadata('name_3', users[2], UsageTypes.default, tenant));

    const metadata_1 = [];
    metadata_1.push(await this.valorizeMetadata('name_1', 'value_1'));
    metadata_1.push(await this.valorizeMetadata('name_2', 'value_2'));
    metadata_1.push(await this.valorizeMetadata('name_3', 'value_3'));

    const metadata_2 = [];
    metadata_2.push(await this.valorizeMetadata('name_1', 'value_4'));
    metadata_2.push(await this.valorizeMetadata('name_2_folk', 'value_5'));
    metadata_2.push(await this.valorizeMetadata('name_3', 'value_6'));

    const metadata_3 = [];
    metadata_3.push(await this.valorizeMetadata('name_1', 'value_4'));
    metadata_3.push(await this.valorizeMetadata('name_2', 'value_5'));
    metadata_3.push(await this.valorizeMetadata('name_3', 'value_6'));
    metadata_3.push(await this.valorizeMetadata('name_4_folk', 'value_7'));

    const versions_dataset_1 = [];
    versions_dataset_1.push(await this.createVersion('1000', 'file_dataset_1_1.csv'));
    versions_dataset_1.push(await this.createVersion('1001', 'file_dataset_1_2.csv'));

    const versions_dataset_2 = [];
    versions_dataset_2.push(await this.createVersion('1002', 'file_dataset_2_1.csv'));
    versions_dataset_2.push(await this.createVersion('1003', 'file_dataset_2_2.csv'));
    versions_dataset_2.push(await this.createVersion('1004', 'file_dataset_2_3.csv'));

    const datasets = [];
    datasets.push(await this.createDataset('dataset_1', users[0], [users[1], users[2]], versions_dataset_1, metadata_1, VisibilityTypes.public, [tags[2], "Folk_tag_1"], tenant));
    datasets.push(await this.createDataset('dataset_2', users[1], [users[2], users[3]], versions_dataset_2, metadata_2, VisibilityTypes.private, [tags[1], "Folk_tag_2"], tenant));    

    const versions_model_1 = [];
    versions_model_1.push(await this.createVersion('1005', 'file_model_1_1.csv'));

    const versions_model_2 = [];
    versions_model_2.push(await this.createVersion('1006', 'file_model_2_1.csv'));
    versions_model_2.push(await this.createVersion('1006', 'file_model_2_2.csv'));

    const models = [];
    models.push(await this.createModel('model_1', users[0], [users[1], users[2]], [datasets[0]], versions_model_1, ModelStatusTypes.training, metadata_1, VisibilityTypes.public, [tags[2], "Folk_tag_1"], tenant));
    models.push(await this.createModel('model_2', users[1], [users[2], users[3]], [datasets[1]], versions_model_2, ModelStatusTypes.test, metadata_2, VisibilityTypes.private, [tags[1], , "Folk_tag_3"], tenant));    
}
