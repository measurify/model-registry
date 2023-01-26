process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory');
const PasswordReset = null;
const UserRoles = require('../types/userRoles');
//const UserStatusTypes = require('../types/userStatusTypes');
const errors = require('../commons/errors');
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes');
chai.use(chaiHttp);
const before = require('./before-test.js');
/*
// Create a new "self" user
describe('/POST self', () => {
    it('it should not POST a user without username field', async () => {
        const user = { password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `username` is required");
    });

    it('it should not POST a user without password field', async () => {
        const user = { username : "test-username-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `password` is required")
    });

    it('it should not POST a user without type field', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Please, supply a user role")
    });

    it('it should not POST a user without tenant field', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `tenant` is required")
    });

    it('it should not POST a user with a fake type field', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : "fake-type", tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("ValidationError: type: Role not existent")
    });
    
    it('it should not POST a user without email field', async () => {
        const user = { username : "test-username-1", password : "test-password-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.missing_email.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_email.message);
    });

    it('it should POST a user', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('username');
        res.body.should.have.property('status');
        res.body.username.should.be.eql(user.username);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
    });

    it('it should not POST a user with already existant username field', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("The username test-username-1 already exists")
    });

    it('it should not POST a user with a fake tenant', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: "fake-tenant" };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Unknown tenant")
    });
    /*Not required
    it('it should not POST a user with already existant email', async () => {
        await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const user = { username : "test-username-2", password : "test-password-1", email: "test-email-1@test.it", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("duplicate key error")
    });
    
});

// Confirm the created user
describe('/GET self', () => {
    it('it should GET a self user to awaiting a profile', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id + '?tenant=' + process.env.DEFAULT_TENANT);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.awaiting);
    });

    it('it should not GET a self user to awaiting a profile without a tenant', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id);
        res.should.have.status(errors.get_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.get_request_error.message);
        res.body.details.should.contain("Query param `tenant` is required");
    });

    it('it should not GET a self user to awaiting a profile with a fake tenant', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id + '?tenant=fake-tenant');
        res.should.have.status(errors.get_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.get_request_error.message);
        res.body.details.should.contain("Unknown tenant");
    });

    it('it should not GET a self user to awaiting a profile with another tenant', async () => {
        const other_tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id + '?tenant=test-tenant-2');
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should PUT a self user to enable the profile as admin', async () => {
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id + '?tenant=' + process.env.DEFAULT_TENANT );
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.awaiting);
        const admin = await factory.createUser("test-username-2", "test-password-2", UserRoles.admin);
        const modification = { status: UserStatusTypes.enabled };
        res = await chai.request(server).keepOpen().put('/v1/users/' + res.body._id + '/status').set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.enabled);
    });

    it('it should not PUT a self user to enable the profile as admin of another tenant', async () => {
        const other_tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst, tenant: process.env.DEFAULT_TENANT };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id + '?tenant=' + process.env.DEFAULT_TENANT );
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.awaiting);
        const admin = await factory.createUser("test-username-2", "test-password-2", UserRoles.admin, null, null, other_tenant);
        const modification = { status: UserStatusTypes.enabled };
        res = await chai.request(server).keepOpen().put('/v1/users/' + res.body._id + '/status').set("Authorization", await factory.getUserToken(admin, other_tenant)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});
*/
// Ask to reset a password
describe('/POST reset', () => {
    it('it should not POST a reset without email field', async () => {
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset?tenant=' + process.env.DEFAULT_TENANT).send({});
        res.should.have.status(errors.missing_email.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_email.message);
    });

    it('it should not POST a reset for a fake email', async () => {
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset?tenant=' + process.env.DEFAULT_TENANT).send({}).send({email: "fake_email"});
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should POST a reset request', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset?tenant=' + process.env.DEFAULT_TENANT).send({}).send({email: user.email});
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('request sent');
    });

    it('it should not POST a reset request for a fake tenant', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset?tenant=fake-tenant').send({}).send({email: user.email});
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Unknown tenant');
    });

    it('it should not POST a reset request for a different tenant', async () => {
        const other_tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset?tenant=' + other_tenant._id).send({}).send({email: user.email});
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Confirm the password reset
describe('/PUT password', () => {
    it('it should PUT a password reset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:reset._id, password:"My_new_password", tenant:process.env.DEFAULT_TENANT};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username');
    });

    it('it should not PUT a password reset without password field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:reset._id, tenant:process.env.DEFAULT_TENANT};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a password reset without reset field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {password:"My_new_password", tenant:process.env.DEFAULT_TENANT};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a password reset with a fake reset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:"fake_reset", password:"My_new_password", tenant:process.env.DEFAULT_TENANT};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a password with a already used reset token', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:reset._id, password:"My_new_password", tenant:process.env.DEFAULT_TENANT};
        let res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.reset_invalid.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.reset_invalid.message);
    });

    it('it should not PUT a password reset with a fake tenant', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:reset._id, password:"My_new_password", tenant:"fake-tenant"};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.get_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.get_request_error.message);
        res.body.details.should.contain('Unknown tenant');
    });

    it('it should not PUT a password reset with a different tenant', async () => {
        const other_tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const body = {reset:reset._id, password:"My_new_password", tenant: other_tenant._id};
        const res = await chai.request(server).keepOpen().put('/' + process.env.VERSION + '/self').send(body);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});
