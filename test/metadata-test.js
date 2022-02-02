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
const UserRoles = require('../types/userRoles.js');
const ModelStatusTypes = require('../types/modelStatusTypes.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const UsageTypes = require('../types/usageTypes.js');
const metadataSchema = require('../models/metadataSchema.js');

// Test the /GET route
describe('/GET metadata', () => {
    it('it should GET all the metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createMetadata("test-metadata-1", user);
        await factory.createMetadata("test-metadata-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/metadata').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET only default metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createMetadata("test-metadata-1", user, UsageTypes.default);
        await factory.createMetadata("test-metadata-2", user, UsageTypes.default);
        await factory.createMetadata("test-metadata-3", user, UsageTypes.folk);
        await factory.createMetadata("test-metadata-4", user, UsageTypes.default);
        const res = await chai.request(server).keepOpen().get('/v1/metadata?filter={"usage":"default"}').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET only folk metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createMetadata("test-metadata-1", user, UsageTypes.default);
        await factory.createMetadata("test-metadata-2", user, UsageTypes.default);
        await factory.createMetadata("test-metadata-3", user, UsageTypes.folk);
        await factory.createMetadata("test-metadata-4", user, UsageTypes.default);
        const res = await chai.request(server).keepOpen().get('/v1/metadata?filter={"usage":"folk"}').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
    });
});

// Test the /POST route
describe('/POST metadata', () => {
    it('it should not POST a metadata without _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadata = {}
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadata)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should not POST a metadata as a regular user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const metadata = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadata)
        res.should.have.status(errors.only_administrator.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.only_administrator.message);
    });

    it('it should POST a metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadata = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadata)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body._id.should.be.eql(metadata._id);
    });

    it('it should not POST a metadata with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const already_existant_metadata = await factory.createMetadata("test-text", user);
        const metadata = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadata)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should POST a list of metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadatas = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadatas)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.metadatas[0]._id.should.be.eql(metadatas[0]._id);
        res.body.metadatas[1]._id.should.be.eql(metadatas[1]._id);
    });

    it('it should POST only not existing metadata from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        let metadatas = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadatas)
        metadatas = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }, { _id: "test-text-3", user }, { _id: "test-text-4", user }, { _id: "test-text-5", user }];
        const res = await chai.request(server).keepOpen().post('/v1/metadata').set("Authorization", await factory.getUserToken(user)).send(metadatas)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.metadatas.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(metadatas[0]._id);
        res.body.errors[1].should.contain(metadatas[1]._id);
        res.body.metadatas[0]._id.should.be.eql(metadatas[2]._id);
        res.body.metadatas[1]._id.should.be.eql(metadatas[3]._id);
        res.body.metadatas[2]._id.should.be.eql(metadatas[4]._id);
    });
});

// Test the /DELETE route
describe('/DELETE metadata', () => {
    it('it should DELETE a metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadata = await factory.createMetadata("test-metadata-1", user);
        const metadata_before = await before.Metadata.find();
        metadata_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/metadata/' + metadata._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const metadata_after = await before.Metadata.find();
        metadata_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadata = await factory.createMetadata("test-metadata-2", user);
        const metadata_before = await before.Metadata.find();
        metadata_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/metadata/fake_metadata').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const metadata_after = await before.Metadata.find();
        metadata_after.length.should.be.eql(1);
    });

    it('it should not DELETE a metadata as a regular user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const metadata = await factory.createMetadata("test-metadata-2", user);
        const metadata_before = await before.Metadata.find();
        metadata_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/metadata/test-metadata-2').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.only_administrator.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.only_administrator.message);
        const metadata_after = await before.Metadata.find();
        metadata_after.length.should.be.eql(1);
    });
});