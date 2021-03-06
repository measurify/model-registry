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

// Test the /GET route
describe('/GET tags', () => {
    it('it should GET all the tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createTag("test-tag-1", user);
        await factory.createTag("test-tag-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET only default tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createTag("test-tag-1", user, UsageTypes.default);
        await factory.createTag("test-tag-2", user, UsageTypes.default);
        await factory.createTag("test-tag-3", user, UsageTypes.folk);
        await factory.createTag("test-tag-4", user, UsageTypes.default);
        const res = await chai.request(server).keepOpen().get('/v1/tags?filter={"usage":"default"}').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET only folk tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await factory.createTag("test-tag-1", user, UsageTypes.default);
        await factory.createTag("test-tag-2", user, UsageTypes.default);
        await factory.createTag("test-tag-3", user, UsageTypes.folk);
        await factory.createTag("test-tag-4", user, UsageTypes.default);
        const res = await chai.request(server).keepOpen().get('/v1/tags?filter={"usage":"folk"}').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
    });
});

// Test the /POST route
describe('/POST tag', () => {
    it('it should not POST a tag without _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tag = {}
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should not POST a tag as a regular user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.only_administrator.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.only_administrator.message);
    });

    it('it should POST a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body._id.should.be.eql(tag._id);
    });

    it('it should not POST a tag with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const already_existant_tag = await factory.createTag("test-text", user);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should POST a list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0]._id.should.be.eql(tags[0]._id);
        res.body.tags[1]._id.should.be.eql(tags[1]._id);
    });

    it('it should POST only not existing tags from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        let tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }, { _id: "test-text-3", user }, { _id: "test-text-4", user }, { _id: "test-text-5", user }];
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(tags[0]._id);
        res.body.errors[1].should.contain(tags[1]._id);
        res.body.tags[0]._id.should.be.eql(tags[2]._id);
        res.body.tags[1]._id.should.be.eql(tags[3]._id);
        res.body.tags[2]._id.should.be.eql(tags[4]._id);
    });
});

// Test the /DELETE route
describe('/DELETE tag', () => {
    it('it should DELETE a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tag = await factory.createTag("test-tag-1", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tag = await factory.createTag("test-tag-2", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/fake_tag').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(1);
    });

    it('it should not DELETE a tag as a regular user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag = await factory.createTag("test-tag-2", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/test-tag-2').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.only_administrator.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.only_administrator.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(1);
    });
});