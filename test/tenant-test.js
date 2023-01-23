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

// Test the /GET route
describe('/GET tenant', () => {
    it('it should GET all the tenants', async () => {
        await factory.createTenant("test-tenant-1", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().get('/v1/tenants').set("Authorization", process.env.API_TOKEN);
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });

    it('it should GET a specific tenant', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().get('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(tenant._id.toString());
    });

    it('it should not GET a fake tenant', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().get('/v1/tenants/fake-tenant').set("Authorization", process.env.API_TOKEN);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not GET a tenant without API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().get('/v1/tenants/' + tenant._id);
        res.should.have.status(errors.authentication_error.status);
    });

    it('it should not GET a tenant with a fake API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().get('/v1/tenants/fake-tenant').set("Authorization", "fake-token");
        res.should.have.status(errors.authentication_error.status);
    });
});

// Test the /POST route
describe('/POST tenant', () => {
    
    it('it should not POST a tenant without _id field', async () => {      
        const tenant = {}
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
    });

    it('it should POST a tenant', async () => {
        const tenant = { _id: "test-tenant-3" }
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(tenant._id);
    });

    it('it should not POST a tenant with already existant _id field', async () => {
       const tenant = { _id: "test-tenant-4" };
        await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key error');
    });

    it('it should POST a list of tenant', async () => {
        const tenants = [{ _id: "test-tenant-5" },
                         { _id: "test-tenant-6" }];
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenants)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tenants[0]._id.should.be.eql(tenants[0]._id);
        res.body.tenants[1]._id.should.be.eql(tenants[1]._id);
    });

    it('it should POST only not existing tenants from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let tenants = [{ _id: "test-tenant-11" },
                        { _id: "test-tenant-31" },
                        { _id: "test-tenant-41" }];
        await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenants);
        tenants = [{ _id: "test-tenant-1" },
                        { _id: "test-tenant-21" },
                        { _id: "test-tenant-31" },
                        { _id: "test-tenant-41" },
                        { _id: "test-tenant-51" }];
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenants);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.tenants.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
        res.body.errors[0].should.contain(tenants[0]._id);
        res.body.errors[1].should.contain(tenants[2]._id);
        res.body.errors[2].should.contain(tenants[3]._id);
        res.body.tenants[0]._id.should.be.eql(tenants[1]._id);
        res.body.tenants[1]._id.should.be.eql(tenants[4]._id);
    });

    it('it should not POST a tenant without API token', async () => {
        const tenant = { _id: "test-tenant-34" }
        const res = await chai.request(server).keepOpen().post('/v1/tenants').send(tenant);
        res.should.have.status(errors.authentication_error.status);
    });

    it('it should not POST a tenant with a fake API token', async () => {
        const tenant = { _id: "test-tenant-34" }
        const res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", "fake-token").send(tenant);
        res.should.have.status(errors.authentication_error.status);
    });

    it('it should login to a new not-hashed tenant', async () => {
        const tenant = { _id: "test-tenant-343242", database: "db-test-1", passwordhash: "false", admin_username: "test-username-1", admin_password: "test-password-1", }
        let res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const request = { username: "test-username-1", password: "test-password-1", tenant: "test-tenant-343242" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });

    it('it should login to a new hashed tenant', async () => {
        const tenant = { _id: "test-tenant-343243", database: "db-test-343243", passwordhash: "true", admin_username: "test-username-1", admin_password: "test-password-1", }
        let res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const request = { username: "test-username-1", password: "test-password-1", tenant: "test-tenant-343243" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });

    it('it should login as a new tenant user (password hashed)', async () => {
        const tenant = { _id: "test-tenant-8747392", passwordhash: "true", admin_username: "test-username-1", admin_password: "test-password-1" }
        let res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const admin_login_request = {username: "test-username-1", password: "test-password-1", tenant:"test-tenant-8747392"};
        const token = (await chai.request(server).keepOpen().post('/v1/login').send(admin_login_request)).body.token;
        const user_request = { username: "test-username-2", password: "test-password-2", role: UserRoles.regular ,email:"test-username-2@gmail.com"};
        res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', token).send(user_request);
        const user_login_request = { username: "test-username-2", password: "test-password-2", tenant: "test-tenant-8747392" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(user_login_request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });

    it('it should login as a new tenant user (password hashed) created from a list', async () => {
        const tenant = { _id: "test-tenant-8747392", passwordhash: "true", admin_username: "test-username-1", admin_password: "test-password-1" }
        let res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const admin_login_request = {username: "test-username-1", password: "test-password-1", tenant:"test-tenant-8747392"};
        const token = (await chai.request(server).keepOpen().post('/v1/login').send(admin_login_request)).body.token;
        const user_request = [ { username : "test-username-4", password : "test-password-4", role: UserRoles.regular,email:"test-username-4@gmail.com" }, 
                               { username : "test-username-5", password : "test-password-5", role: UserRoles.regular,email:"test-username-5@gmail.com" } ]; 
        res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', token).send(user_request);
        const user_login_request = { username: "test-username-5", password: "test-password-5", tenant: "test-tenant-8747392" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(user_login_request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });

    it('it should login as a tenant user (password hashed) that modify his password', async () => {
        const tenant = { _id: "test-tenant-8747392", passwordhash: "true", admin_username: "test-username-1", admin_password: "test-password-1" }
        let res = await chai.request(server).keepOpen().post('/v1/tenants').set("Authorization", process.env.API_TOKEN).send(tenant);
        const admin_login_request = {username: "test-username-1", password: "test-password-1", tenant:"test-tenant-8747392"};
        const token = (await chai.request(server).keepOpen().post('/v1/login').send(admin_login_request)).body.token;
        const user_request = { username: "test-username-6", password: "test-password-6", role: UserRoles.regular,email:"test-username-6@gmail.com" };
        res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', token).send(user_request);
        const user_id = res.body._id;
        const user_login_request = { username: "test-username-6", password: "test-password-6", tenant: "test-tenant-8747392" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(user_login_request);
        const modification_requues = { password: 'new_password' };
        res = await chai.request(server).keepOpen().put('/v1/users/' + user_id).set("Authorization", res.body.token).send(modification_requues);
        const user_login_request_new = { username: "test-username-6", password: "new_password", tenant: "test-tenant-8747392" };
        res = await chai.request(server).keepOpen().post('/v1/login').send(user_login_request_new);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });
});

// Test the /DELETE route
describe('/DELETE tenant', () => {
    it('it should DELETE a tenant', async () => {
        const tenant = await factory.createTenant("test-tenant-200", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const tenants_before = await before.Tenant.find();
        tenants_before.length.should.be.eql(17);
        const res = await chai.request(server).keepOpen().delete('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN);
        res.should.have.status(200);
        res.body.should.be.a('object');
        const tenants_after = await before.Tenant.find();
        tenants_after.length.should.be.eql(16);
    });

    it('it should not DELETE a fake tenant', async () => {
        const tenant = await factory.createTenant("test-tenant-200", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const tenants_before = await before.Tenant.find();
        tenants_before.length.should.be.eql(17);
        const res = await chai.request(server).keepOpen().delete('/v1/tenants/fake_tenant').set("Authorization", process.env.API_TOKEN);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const tenants_after = await before.Tenant.find();
        tenants_after.length.should.be.eql(17);
    });

    it('it should not DELETE a tenant without API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().delete('/v1/tenants/' + tenant._id);
        res.should.have.status(errors.authentication_error.status);
    });

    it('it should not DELETE a tenant with a fake API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const res = await chai.request(server).keepOpen().delete('/v1/tenants/fake-tenant').set("Authorization", "fake-token");
        res.should.have.status(errors.authentication_error.status);
    });
});

// Test the /PUT route
describe('/PUT tenant', () => {    
    it('it should PUT a tenant to change organization', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { organization: "organization-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('organization');
        res.body.organization.should.be.eql("organization-test-2");
    });

    it('it should PUT a tenant to change address', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { address: "address-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('address');
        res.body.address.should.be.eql("address-test-2");
    });

    it('it should PUT a tenant to change email', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { email: "email-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('email');
        res.body.email.should.be.eql("email-test-2");
    });

    it('it should PUT a tenant to change phone', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { phone: "phone-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('phone');
        res.body.phone.should.be.eql("phone-test-2");
    });

    it('it should not PUT a fake tenant', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { address: "phone-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/fake-tenant').set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a tenant with a wrong field', async () => {
        const tenant = await factory.createTenant("test-tenant-300", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { address: "phone-test-2", fakefield: "fake-value" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).set("Authorization", process.env.API_TOKEN).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });

    it('it should not DELETE a tenant without API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { address: "phone-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/' + tenant._id).send(modification);
        res.should.have.status(errors.authentication_error.status);
    });

    it('it should not DELETE a tenant with a fake API token', async () => {
        const tenant = await factory.createTenant("test-tenant-2", "organization-test-1", "test street", "test@email", "433232", "test", "test");
        const modification = { address: "phone-test-2" };
        const res = await chai.request(server).keepOpen().put('/v1/tenants/fake-tenant').set("Authorization", "fake-token").send(modification);
        res.should.have.status(errors.authentication_error.status);
    });
});
