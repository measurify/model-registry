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

describe('/POST model', () => {
    it('it should create a number of folk tags and metadta after posting a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tags = ["tag-1", "tag-2", "tag-3"];
        const metadata = [  { "name" : "name_1", "value": "value_1" },
                            { "name" : "name_2", "value": "value_2" } ];
        const model = { "name": "dataset-name_test_1", "users": [], "metadata": metadata, "visibility": "public", "tags": tags, "datasets": [] }
        const res = await chai.request(server).keepOpen().post('/v1/models').set("Authorization", await factory.getUserToken(owner)).send(model);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(3);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(2);
    });

    it('it should not create already existant tags and metadata after posting a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-1", owner);
        const tag_2 = await factory.createTag("tag-2", owner);
        const tags_before = await before.Tag.find({});
        const tags = ["tag-1", "tag-2", "tag-3"];
        const metadata_1 = await factory.createMetadata("name_1", owner);
        const metadata_before = await before.Metadata.find({});
        const metadata = [  { "name" : "name_1", "value": "value_1" },
                            { "name" : "name_2", "value": "value_2" } ];
        const model = { "name": "dataset-name_test_1", "users": [], "metadata": metadata, "visibility": "public", "tags": tags, "datasets": [] }
        const res = await chai.request(server).keepOpen().post('/v1/models').set("Authorization", await factory.getUserToken(owner)).send(model);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 1);
    });
});

describe('/POST dataset', () => {
    it('it should create a number of folk tags and metadata after posting a dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tags = ["tag-1", "tag-2", "tag-3"];
        const metadata = [  { "name" : "name_1", "value": "value_1" },
                            { "name" : "name_2", "value": "value_2" } ];
        const dataset = { "name": "dataset-name_test_1", "users": [], "metadata": metadata, "visibility": "public", "tags": tags}
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(owner)).send(dataset);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(3);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(2);
    });

    it('it should not create already existant tags and metadata after posting a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-1", owner);
        const tag_2 = await factory.createTag("tag-2", owner);
        const tags_before = await before.Tag.find({});
        const tags = ["tag-1", "tag-2", "tag-3"];
        const metadata_1 = await factory.createMetadata("name_1", owner);
        const metadata_before = await before.Metadata.find({});
        const metadata = [  { "name" : "name_1", "value": "value_1" },
                            { "name" : "name_2", "value": "value_2" } ];
        const dataset = { "name": "dataset-name_test_1", "users": [], "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(owner)).send(dataset);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 1);
    });
});

describe('/PUT dataset', () => {
    it('it should create a number of folk tags and metadta after modify a model', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-test-1", owner);
        await factory.createMetadata("name_1", owner);
        const metadata_1 = {name: 'name_1', value: 'value_1'};
        const metadata_2 = {name: 'name_2', value: 'value_2'};
        const metadata_3 = {name: 'name_3', value: 'value_3'};
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [metadata_1], VisibilityTypes.private, [tag_1]);
        const tags_before = await before.Tag.find({});
        const metadata_before = await before.Metadata.find({});
        const modification = { tags: { remove: [tag_1._id], add: ["folk_tag_1", "folk_tag_2"] },
                               metadata: { remove: [metadata_1], add: [metadata_2, metadata_3] } }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 2);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 2);
    });
});

describe('/PUT model', () => {
    it('it should create a number of folk tags and metadta after modify a model', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-test-1", owner);
        await factory.createMetadata("name_1", owner);
        const metadata_1 = {name: 'name_1', value: 'value_1'};
        const metadata_2 = {name: 'name_2', value: 'value_2'};
        const metadata_3 = {name: 'name_3', value: 'value_3'};
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [metadata_1], VisibilityTypes.private, [tag_1]);
        const tags_before = await before.Tag.find({});
        const metadata_before = await before.Metadata.find({});
        const modification = { tags: { remove: [tag_1._id], add: ["folk_tag_1", "folk_tag_2"] },
                               metadata: { remove: [metadata_1], add: [metadata_2, metadata_3] } }
        const res = await chai.request(server).keepOpen().put('/v1/models/' + model._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 2);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 2);
    });
});