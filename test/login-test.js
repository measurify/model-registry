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
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

// Test the /POST route
describe('/POST login', () => {
    it('it should POST a login with correct username and password', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        const request = { username: "test-username-1", password: "test-password-1" };
        const res = await chai.request(server).keepOpen().post('/v1/login').send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
    });

    it('it should not POST a login with a fake username', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        const request = {username: "fake-username-1", password: "test-password-1"};
        const res = await chai.request(server).keepOpen().post('/v1/login').send(request);
        res.should.have.status(errors.authentication_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.authentication_error.message);
        res.body.details.should.contain('Incorrect username or password');
    });

    it('it should not POST a login with a fake password', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        const request = {username: "test-username-1", password: "fake-password-1"};
        const res = await chai.request(server).keepOpen().post('/v1/login').send(request);
        res.should.have.status(errors.authentication_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.authentication_error.message);
        res.body.details.should.contain('Incorrect username or password');
    });
});
