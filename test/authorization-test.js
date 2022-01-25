process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
require('../security/authentication.js');
const Authorization = require('../security/authorization.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

describe('is administrator?', () => {
    it('it should answer true if the user is an administrator', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const result = Authorization.isAdministrator(user);
        result.should.equal(true);
    });

    it('it should answer false if the user is a not an administrator', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const result = Authorization.isAdministrator(user);
        result.should.equal(false);
    });
});

describe('is owner?', () => {
    it('it should answer true if the user is the owner of a model', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model", user);
        const result = Authorization.isOwner(model, user);
        result.should.equal(true);
    });

    it('it should answer true if the user is the owner of a dataset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset", user);
        const result = Authorization.isOwner(dataset, user);
        result.should.equal(true);
    });

    it('it should answer false if the user is not the owner of a dataset', async () => {
        const user_not_owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_owner = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const dataset = await factory.createDataset("test-dataset", user_owner);
        const result = Authorization.isOwner(dataset, user_not_owner);
        result.should.equal(false);
    });

    it('it should answer false if the user is not the owner of a model', async () => {
        const user_not_owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_owner = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const model = await factory.createModel("test-model", user_owner);
        const result = Authorization.isOwner(model, user_not_owner);
        result.should.equal(false);
    });
});
