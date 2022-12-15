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
const AlgorithmStatusTypes = require('../types/algorithmStatusTypes.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

// Test the /GET route
describe('/GET algorithm', () => {
    it('it should GET all the algorithms as admin', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const a= await factory.createAlgorithm("test-algorithm-1", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        await factory.createAlgorithm("test-algorithm-2", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms').set("Authorization", await factory.getAdminToken());
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET public, owned and shared algorithms as regular user', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        await factory.createAlgorithm("test-algorithm-1", user_1, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        await factory.createAlgorithm("test-algorithm-2", user_1, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        await factory.createAlgorithm("test-algorithm-3", user_2, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        await factory.createAlgorithm("test-algorithm-4", user_2, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        await factory.createAlgorithm("test-algorithm-5", user_2, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        await factory.createAlgorithm("test-algorithm-6", user_2, [user_1], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms').set("Authorization", await factory.getUserToken(user_1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });

    it('it should GET a specific owned algorithm', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(algorithm._id.toString());
    });

    it('it should GET a shared algorithm', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", user_1, [user_2], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user_2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(algorithm._id.toString());
    });

    it('it should GET a public algorithm', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", user_1, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user_2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(algorithm._id.toString());
    });

    it('it should not GET a fake algorithm', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const res = await chai.request(server).keepOpen().get('/v1/algorithms/fake-algorithm').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST dataset', () => {
    it('it should not POST a algorithm without name field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const algorithm = { "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/algorithms').set("Authorization", await factory.getUserToken(user)).send(algorithm)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a valid name');
    });

    it('it should POST a algorithm', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user_1, [], [], [], VisibilityTypes.public, []);
        const datasets = [dataset._id];
        const tag = await factory.createTag("test-tag-1", user_1);
        const tags_before = await before.Tag.find({});
        const users = [user_2._id];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const metadata_before = await before.Metadata.find({});
        const tags = [tag._id, "folk_tag"];
        const algorithm = { "name": "dataset-name_test_1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags, "datasets": datasets }
        const res = await chai.request(server).keepOpen().post('/v1/algorithms').set("Authorization", await factory.getUserToken(user_1)).send(algorithm);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(metadata_before.length + 1);
    });

    it('it should not POST a algorithm with already existant name for the same user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const already_existant_algorithm = await factory.createAlgorithm("test-algorithm-1", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const algorithm = { "name": "test-algorithm-1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/algorithms').set("Authorization", await factory.getUserToken(user)).send(algorithm)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('An algorithm with the same name already exists for this user');
    });

    it('it should POST a algorithm with already existant name for another user', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const already_existant_algorithm = await factory.createAlgorithm("test-algorithm-1", user_2, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        const users = [];
        const metadata = [  { "name" : "name_1", "value": "value_1" } ];
        const tags = [];
        const algorithm = { "name": "test-algorithm-1", "users": users, "metadata": metadata, "visibility": "public", "tags": tags }
        const res = await chai.request(server).keepOpen().post('/v1/algorithms').set("Authorization", await factory.getUserToken(user_1)).send(algorithm);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
    });
});

// Test the /DELETE route
describe('/DELETE dataset', () => {
    it('it should DELETE a algorithm', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const algorithms_before = await before.Algorithm.find();
        algorithms_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const algorithms_after = await before.Algorithm.find();
        algorithms_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake algorithm', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", user, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const algorithms_before = await before.Algorithm.find();
        algorithms_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/algorithms/fake-algorithm').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status)
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const algorithms_after = await before.Algorithm.find();
        algorithms_after.length.should.be.eql(1);
    });

    it('it should not DELETE a algorithm as a user', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [user._id], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const algorithms_before = await before.Algorithm.find();
        algorithms_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_delete.status)
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
        const algorithms_after = await before.Algorithm.find();
        algorithms_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT dataset', () => {
    it('it should PUT a algorithm to modify users list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_1 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const user_2 = await factory.createUser("test-username-3", "test-password-3", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [user_1], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { users: { remove: [user_1._id], add: [user_2._id] } }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.users.length.should.be.eql(1);
        String(res.body.users[0]._id).should.eql(String(user_2._id))
    });

    it('it should PUT a algorithm to modify tags list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag_1 = await factory.createTag("tag-test-1", owner);
        const tag_2 = await factory.createTag("tag-test-2", owner);
        const tags_before = await before.Tag.find({});
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, [tag_1]);
        const modification = { tags: { remove: [tag_1._id], add: [tag_2._id, "folk_tag"] } }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(2);
        String(res.body.tags[0]).should.eql(String(tag_2._id))
        const tags_after = await before.Tag.find({});
        tags_after.length.should.be.eql(tags_before.length + 1);
    });

    it('it should PUT a algorithm to modify dataset list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset_1 = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const dataset_2 = await factory.createDataset("test-dataset-2", owner, [], [], [], VisibilityTypes.private, []);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [dataset_1], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { datasets: { remove: [dataset_1._id], add: [dataset_2._id] } }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.datasets.length.should.be.eql(1);
        String(res.body.datasets[0]._id).should.eql(String(dataset_2._id))
    });

    it('it should PUT a algorithm to modify metadata list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const metadata_1 = {name: 'name_1', value: 'value_1'};
        const metadata_2 = {name: 'name_2', value: 'value_2'};
        const metadata_3 = {name: 'name_3', value: 'value_3'};
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [metadata_1], VisibilityTypes.private, []);
        const modification = { metadata: { remove: [metadata_1], add: [metadata_2, metadata_3] } }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.metadata.length.should.be.eql(2);
        res.body.metadata[0].should.eql(metadata_2);
        const metadata_after = await before.Metadata.find({});
        metadata_after.length.should.be.eql(3);
    });

    it('it should PUT a algorithm to modify visibility', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { visibility: VisibilityTypes.public }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.visibility.should.eql(VisibilityTypes.public)
    });

    it('it should not PUT a not owned algorithm', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { visibility: VisibilityTypes.public }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a algorithm to modify users list with a fake user', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user_1 = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [user_1], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { users: { remove: [user_1._id], add: ["fake_user"] } }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
    });

    it('it should not PUT a algorithm with a wrong field', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const modification = { fake: "fake_value" }
        const res = await chai.request(server).keepOpen().put('/v1/algorithms/' + algorithm._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });
});