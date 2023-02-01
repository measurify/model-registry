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
const AlgorithmStatusTypes = require('../types/algorithmStatusTypes.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const filemanager = require('../commons/filemanager.js');

// Test the /POST route
describe('/POST version', () => {
    it('it should POST a version of a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        await filemanager.delete(res.body.versions[0].key);
    });

    it('it should POST a version of an algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        await filemanager.delete(res.body.versions[0].key);
    });

    it('it should POST a version of a dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        await filemanager.delete(res.body.versions[0].key);
    });

    it('it should not POST a version of a not owned model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
    });

    it('it should not POST a version of a not owned algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
    });

    it('it should not POST a version of a not owned dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        const res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
    });    

    it('it should POST a version of a dataset with the same filename (but different ordinal)', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key;        
        res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(2);
        res.body.versions[1].original.should.be.eql('test.png');
        res.body.versions[1].ordinal.should.be.eql('2');
        const key2 = res.body.versions[1].key; 
        await filemanager.delete(key);
        await filemanager.delete(key2);
    });

    it('it should POST a version of a model with the same filename (but different ordinal)', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(2);
        res.body.versions[1].original.should.be.eql('test.png');
        res.body.versions[1].ordinal.should.be.eql('2');
        const key2 = res.body.versions[1].key;
        await filemanager.delete(key);
        await filemanager.delete(key2);
    });

    it('it should POST a version of a algorithm with the same filename (but different ordinal)', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(2);
        res.body.versions[1].original.should.be.eql('test.png');
        res.body.versions[1].ordinal.should.be.eql('2');
        const key2 = res.body.versions[1].key;
        await filemanager.delete(key);
        await filemanager.delete(key2);
    });

    it('it should POST a version of a dataset with the same filename (choosing my custom ordinal)', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions?ordinal=70').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('70');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions?ordinal=100').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(2);
        res.body.versions[1].original.should.be.eql('test.png');
        res.body.versions[1].ordinal.should.be.eql('100');
        const key2 = res.body.versions[1].key;
        await filemanager.delete(key);
        await filemanager.delete(key2);
    });

    it('it should not POST a version of a dataset with the same custom ordinal value', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions?ordinal=70').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('70');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions?ordinal=70').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql("Ordinal value duplicated: 70 , Please choose another value or let default incremental choice");
        await filemanager.delete(key);
    });
});

// Test the /DELETE route
describe('/DELETE version', () => {
    it('it should DELETE a version of a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        res = await chai.request(server).keepOpen().delete('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(0);
    });

    it('it should DELETE a version of a algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        res = await chai.request(server).keepOpen().delete('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(0);
    });

    it('it should DELETE a version of a dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');        
        res.body.versions[0].ordinal.should.be.eql('1');
        res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(0);
    });

    it('it should not DELETE a version of a not owned model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().delete('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
        await filemanager.delete(key);
    });

    it('it should not DELETE a version of a not owned algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().delete('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
        await filemanager.delete(key);
    });

    it('it should not DELETE a version of a not owned dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');        
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
        await filemanager.delete(key);
    });
});

// Test the /GET route
describe('/GET version', () => {    
    it('it should GET a version of a model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a model with custom ordinal', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions?ordinal=80').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('80');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of an algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of an algorithm with custom ordinal', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions?ordinal=80').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('80');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a dataset with custom ordinal', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions?ordinal=110').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('110');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a public dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.public, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a public model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.public, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a public algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.public, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a shared model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [user], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a shared algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [user], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should GET a version of a shared dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [user], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('image/png');
        await filemanager.delete(key);
    });

    it('it should not GET a version of a not owned dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_read.message);
        await filemanager.delete(key);
    });

    it('it should not GET a version of a not owned model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_read.message);
        await filemanager.delete(key);
    });

    it('it should not GET a version of a not owned algorithm', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const algorithm = await factory.createAlgorithm("test-algorithm-1", owner, [], [], [], AlgorithmStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/algorithms/' + algorithm._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        res.body.versions[0].ordinal.should.be.eql('1');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().get('/v1/algorithms/' + algorithm._id + '/versions/'+res.body.versions[0].ordinal).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_read.message);
        await filemanager.delete(key);
    });
});
