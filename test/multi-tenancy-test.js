process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const test = require('./before-test.js');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

describe('Contents in different tanant', () => {
    it('it should GET all the tags of a specific tenant', async () => {
        const tenant_1 = await factory.createTenant("test-tenant-1", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const tenant_2 = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const user_tenant_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular, tenant_1);
        const user_tenant_2 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular, tenant_2);
        const tag1_tenant_1 = await factory.createTag("test-tag-1", user_tenant_1, tenant_1);
        const tag2_tenant_1 = await factory.createTag("test-tag-2", user_tenant_1, tenant_1);
        const tag3_tenant_1 = await factory.createTag("test-tag-3", user_tenant_1, tenant_1);
        const tag1_tenant_2 = await factory.createTag("test-tag-1", user_tenant_2, tenant_2);
        const tag2_tenant_2 = await factory.createTag("test-taf-2", user_tenant_2, tenant_2);
        let res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getUserToken(user_tenant_1, tenant_1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getUserToken(user_tenant_2, tenant_2));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });
});
