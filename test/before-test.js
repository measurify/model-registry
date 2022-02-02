// Import environmental variables from variables.test.env file
require('dotenv').config({ path: './init/variables.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const database = require('../database.js');
const mongoose = require('mongoose');
const factory = require('../commons/factory.js');

exports.User = null;
exports.Tag = null;
exports.Metadata = null;
exports.Log = null;
exports.Model = null;
exports.Dataset = null;
exports.Tenant = null;

before(async () => { 
    // Init Database
    await database.init('test');
  
    this.User = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('User');
    this.Tag = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Tag');
    this.Metadata = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Metadata');
    this.Model = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Model');
    this.Dataset = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Dataset');
    this.Tenant = mongoose.dbs['catalog'].model('Tenant');
});

beforeEach(async () => { 
    await factory.dropContents(); 
});
