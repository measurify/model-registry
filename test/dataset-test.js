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

// Test the /GET route
describe('/GET dataset', () => {
    it('it should GET all the datasets as admin', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        await factory.createDataset("test-dataset-2", user, [], [], [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/datasets').set("Authorization", await factory.getAdminToken());
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET all the datasets with query selection specific fields (_id and user always present)', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        await factory.createDataset("test-dataset-2", user, [], [], [], VisibilityTypes.private, []);
        let res = await chai.request(server).keepOpen().get('/v1/datasets?select=["_id","name","visibility","users"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(4);
        Object.keys(res.body.docs[1]).length.should.be.eql(4);
        res.body.docs[0].name.should.be.eql("test-dataset-2");
        res.body.docs[0].visibility.should.be.eql("private");
        res.body.docs[0].users.should.be.eql([]);
        res = await chai.request(server).keepOpen().get('/v1/datasets?select=["visibility","users"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(3);
        Object.keys(res.body.docs[1]).length.should.be.eql(3);
        res.body.docs[0].visibility.should.be.eql("private");
        res.body.docs[0].users.should.be.eql([]);
        res = await chai.request(server).keepOpen().get('/v1/datasets?select=["_id"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(2);
        Object.keys(res.body.docs[1]).length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/datasets?select=["name"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(3);
        Object.keys(res.body.docs[1]).length.should.be.eql(3);
        res.body.docs[0].name.should.be.eql("test-dataset-2");
        res = await chai.request(server).keepOpen().get('/v1/datasets?select=["fakeField"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(2);
        Object.keys(res.body.docs[1]).length.should.be.eql(2);
    });

    it('it should GET all the datasets with query selection specific fields (_id and user always present)', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset=await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);        
        let res = await chai.request(server).keepOpen().get('/v1/datasets/'+dataset._id+'?select=["_id","name","visibility","users"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');      
        Object.keys(res.body).length.should.be.eql(4);
        res.body.name.should.be.eql("test-dataset-1");
        res.body.visibility.should.be.eql("private");
        res.body.users.should.be.eql([]);
        res = await chai.request(server).keepOpen().get('/v1/datasets/'+dataset._id+'?select=["visibility","users"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');      
        Object.keys(res.body).length.should.be.eql(3);
        res.body.visibility.should.be.eql("private");
        res.body.users.should.be.eql([]);
        res = await chai.request(server).keepOpen().get('/v1/datasets/'+dataset._id+'?select=["_id"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');    
        Object.keys(res.body).length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/datasets/'+dataset._id+'?select=["name"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');    
        Object.keys(res.body).length.should.be.eql(3);
        res.body.name.should.be.eql("test-dataset-1");
        res = await chai.request(server).keepOpen().get('/v1/datasets/'+dataset._id+'?select=["fakeField"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');   
        Object.keys(res.body).length.should.be.eql(2);
    });

    it('it should GET public, owned and shared datasets as regular user', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        await factory.createDataset("test-dataset-1", user_1, [], [], [], VisibilityTypes.private, []);
        await factory.createDataset("test-dataset-2", user_1, [], [], [], VisibilityTypes.public, []);
        await factory.createDataset("test-dataset-3", user_2, [], [], [], VisibilityTypes.private, []);
        await factory.createDataset("test-dataset-4", user_2, [], [], [], VisibilityTypes.public, []);
        await factory.createDataset("test-dataset-5", user_2, [], [], [], VisibilityTypes.private, []);
        await factory.createDataset("test-dataset-6", user_2, [user_1], [], [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/datasets').set("Authorization", await factory.getUserToken(user_1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });

    it('it should GET a specific owned dataset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(dataset._id.toString());
    });

    it('it should GET a shared dataset', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user_1, [user_2], [], [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user_2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(dataset._id.toString());
    });

    it('it should GET a public dataset', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user_1, [], [], [], VisibilityTypes.public, []);
        const res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user_2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(dataset._id.toString());
    });

    it('it should not GET a fake dataset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const res = await chai.request(server).keepOpen().get('/v1/datasets/fake-dataset').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST dataset', () => {
    it('it should not POST a dataset without name field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const dataset = { "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(user)).send(dataset)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a valid name');
    });

    it('it should POST a dataset', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const tag = await factory.createTag("test-tag-1", user_1);
        const tags_before = await before.Tag.find({});
        const users = [user_2._id];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const metadata_before = await before.Metadata.find({});
        const tags = [tag._id, "folk_tag"];
        const dataset = { "name": "dataset-name_test_1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(user_1)).send(dataset);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 1);
    });

    it('it should not POST a dataset with already existant name for the same user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const already_existant_dataset = await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.public, []);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const dataset = { "name": "test-dataset-1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(user)).send(dataset)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('A dataset with the same name already exists for this user');
    });

    it('it should POST a dataset with already existant name for another user', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const already_existant_dataset = await factory.createDataset("test-dataset-1", user_2, [], [], [], VisibilityTypes.public, []);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const dataset = { "name": "test-dataset-1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/datasets').set("Authorization", await factory.getUserToken(user_1)).send(dataset);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
    });
});

// Test the /DELETE route
describe('/DELETE dataset', () => {
    it('it should DELETE a dataset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        const dataset_before = await before.Dataset.find();
        dataset_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const datasets_after = await before.Dataset.find();
        datasets_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake dataset', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        const dataset_before = await before.Dataset.find();
        dataset_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datasets/fake-dataset').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status)
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const datasets_after = await before.Dataset.find();
        datasets_after.length.should.be.eql(1);
    });

    it('it should not DELETE a dataset as a user', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [user._id], [], [], VisibilityTypes.private, []);
        const dataset_before = await before.Dataset.find();
        dataset_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_delete.status)
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
        const datasets_after = await before.Dataset.find();
        datasets_after.length.should.be.eql(1);
    });

    it('it should not DELETE a dataset already used in a model', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user, [], [], [], VisibilityTypes.private, []);
        const model = await factory.createModel("test-model", user, [], [dataset], [], ModelStatusTypes.training, [], VisibilityTypes.public, []);
        const datasets_before = await before.Dataset.find();
        datasets_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.delete_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.delete_request_error.message);
        const datasets_after = await before.Dataset.find();
        datasets_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT dataset', () => {
    it('it should PUT a dataset to modify users list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_1 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-3", "test-password-3", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [user_1], [], [], VisibilityTypes.private, []);
        const modification = { users: { remove: [user_1._id], add: [user_2._id] } }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.users.length.should.be.eql(1);
        String(res.body.users[0]._id).should.eql(String(user_2._id))
    });

    it('it should PUT a dataset to modify tags list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-test-1", owner);
        const tag_2 = await factory.createTag("tag-test-2", owner);
        const tags_before = await before.Tag.find({});
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, [tag_1]);
        const modification = { tags: { remove: [tag_1._id], add: [tag_2._id, "folk_tag"] } }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(2);
        String(res.body.tags[0]).should.eql(String(tag_2._id))
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
    });

    it('it should PUT a dataset to modify metadata list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const metadata_1 = {name: 'name_1', value: 'value_1'};
        const metadata_2 = {name: 'name_2', value: 'value_2'};
        const metadata_3 = {name: 'name_3', value: 'value_3'};
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [metadata_1], VisibilityTypes.private, []);
        const modification = { metadata: { remove: [metadata_1], add: [metadata_2, metadata_3] } }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.metadata.length.should.be.eql(2);
        res.body.metadata[0].should.eql(metadata_2);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(3);
    });

    it('it should PUT a dataset to modify visibility', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const modification = { visibility: VisibilityTypes.public }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.visibility.should.eql(VisibilityTypes.public)
    });

    it('it should not PUT a not owned dataset', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const modification = { visibility: VisibilityTypes.public }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a dataset to modify users list with a fake user', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_1 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [user_1], [], [], VisibilityTypes.private, []);
        const modification = { users: { remove: [user_1._id], add: ["fake_user"] } }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
    });

    it('it should not PUT a dataset with a wrong field', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const modification = { fake: "fake_value" }
        const res = await chai.request(server).keepOpen().put('/v1/datasets/' + dataset._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });
});