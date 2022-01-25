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

    it('it should not POST a version of a not owned dataset', async () => {
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

    it('it should not POST a version of a not owned model', async () => {
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

    it('it should not POST a version of a dataset with the same filename', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.generic_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.generic_request_error.message);
        await filemanager.delete(key);
    });

    it('it should not POST a version of a dataset with the same filename', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.generic_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.generic_request_error.message);
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
        res = await chai.request(server).keepOpen().delete('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(owner));
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
        res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(0);
    });

    it('it should not DELETE a version of a not owned dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const model = await factory.createModel("test-model-1", owner, [], [], [], ModelStatusTypes.training, [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/models/' + model._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().delete('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_modify.message);
        await filemanager.delete(key);
    });

    it('it should not DELETE a version of a not owned model', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", owner, [], [], [], VisibilityTypes.private, []);
        const file = './test/test.png';
        let res = await chai.request(server).keepOpen().post('/v1/datasets/' + dataset._id + '/versions').attach('file', file).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.versions.should.be.a('array');
        res.body.versions.length.should.be.eql(1);
        res.body.versions[0].original.should.be.eql('test.png');
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().delete('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        const key = res.body.versions[0].key
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.header['content-type'].should.be.eql('application/octet-stream');
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
        res = await chai.request(server).keepOpen().get('/v1/datasets/' + dataset._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
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
        const key = res.body.versions[0].key;
        res = await chai.request(server).keepOpen().get('/v1/models/' + model._id + '/versions/test.png').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_read.message);
        await filemanager.delete(key);
    });
});