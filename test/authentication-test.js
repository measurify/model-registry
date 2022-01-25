process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const authentication = require('../security/authentication.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

describe('encode and decode', () => {
    it('it should decode a previus encoded string', async () => {
        const user = await factory.createUser("test-usern-1", UserRoles.admin);
        const encoded = authentication.encode(user, process.env.DEFAULT_TENANT);
        encoded.should.contain('JWT');
        const decoded = authentication.decode(encoded)
        decoded.user._id.should.equal(String(user._id));
    });

    it('it should not decode a fake encoded string', async () => {
        const decoded = authentication.decode("fake")
        decoded.should.contain("invalid token");
    });
});
