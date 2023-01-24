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
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

// Test the /GET route
describe('/GET users', () => {
    it('it should GET all the users', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        await factory.createUser("test-username-2", "test-password-2");
        const res = await chai.request(server).keepOpen().get('/v1/users').set('Authorization', await factory.getAdminToken());
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET all the users as a regular user but not role information', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        await factory.createUser("test-username-1", "test-password-1");
        await factory.createUser("test-username-2", "test-password-2");
        const res = await chai.request(server).keepOpen().get('/v1/users').set('Authorization', await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET a specific user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1");
        const res = await chai.request(server).keepOpen().get('/v1/users/' + user._id).set('Authorization', await factory.getAdminToken());
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(user._id.toString());
    });

    it('it should GET a specific user as a regular user but not role information', async () => {
        const regular = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const user = await factory.createUser("test-username-1", "test-password-1");
        const res = await chai.request(server).keepOpen().get('/v1/users/' + user._id).set('Authorization', await factory.getUserToken(regular));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(user._id.toString());
    });

    it('it should not GET a fake user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1");
        const res = await chai.request(server).keepOpen().get('/v1/users/fake-user').set('Authorization', await factory.getAdminToken());
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.resource_not_found.message);
    });
}); 

// Test the /POST route
describe('/POST users', () => {
    it('it should not POST a user without username field', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { password : "test-password-1", role : "regular", email:"test-username-@gmail.com" };
        const res = await chai.request(server).keepOpen().post('/v1/users').set("Authorization", await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `username` is required");
    });

    it('it should not POST a user without password field', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { username: "test-username-1",  role: "regular", email:"test-username-@gmail.com" };
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `password` is required");
    });

    it('it should not POST a user without email field', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { username: "test-username-1",password : "test-password-1",  role: "regular"};
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Please, supply an email");
    });

    it('it should not POST a user without role field', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { username: "test-username-1", password : "test-password-1", email:"test-username-@gmail.com" };
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `role` is required");
    });

    it('it should not POST a user with a fake type', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { username: "test-username-1", password : "test-password-1", role: "fake-type" , email:"test-username-@gmail.com"};
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("is not a valid enum value for path");
    });

    it('it should POST a user', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = { username : "test-username-1", password : "test-password-1", role: UserRoles.regular, email:"test-username-@gmail.com" };
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('username');
        res.body.should.have.property('role');
        res.body.username.should.be.eql(user.username);
    });

    it('it should not POST a user with already existant username field', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        await factory.createUser("test-username-1", "test-password-1");
        const user = { username : "test-username-1", password : "test-password-1", role : UserRoles.regular, email:"test-username-@gmail.com"};
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("a user with the same username already exists");
    });

    it('it should POST a list of users', async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const users = [ { username : "test-username-1", password : "test-password-1", role: UserRoles.regular, email:"test-username-1@gmail.com" }, 
                        { username : "test-username-2", password : "test-password-2", role: UserRoles.regular , email:"test-username-2@gmail.com"} ]; 
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(users)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.users[0].username.should.be.eql(users[0].username);
        res.body.users[1].username.should.be.eql(users[1].username);
    });

    it('it should POST only not existing users from a list', async () => {
        await factory.createUser("test-username-1", "test-password-1");
        await factory.createUser("test-username-2", "test-password-2");
        const users = [ { username : "test-username-1", password : "test-password-1", role: UserRoles.regular, email:"test-username-3@gmail.com" },
                        { username : "test-username-1", password : "test-password-2", role: UserRoles.regular, email:"test-username-4@gmail.com" },
                        { username : "test-username-3", password : "test-password-3", role: UserRoles.regular, email:"test-username-5@gmail.com" },
                        { username : "test-username-4", password : "test-password-4", role: UserRoles.regular, email:"test-username-6@gmail.com" },
                        { username : "test-username-5", password : "test-password-5", role: UserRoles.regular, email:"test-username-7@gmail.com" } ]; 
        const res = await chai.request(server).keepOpen().post('/v1/users').set('Authorization', await factory.getAdminToken()).send(users)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.users.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(users[0].username);
        res.body.errors[1].should.contain(users[1].username);
        res.body.users[0].username.should.be.eql(users[2].username);
        res.body.users[1].username.should.be.eql(users[3].username);
        res.body.users[2].username.should.be.eql(users[4].username);
    });

    it("it should POST a user with validityPasswordDays", async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = {
          username: "test-username-1",
          password: "test-password-1",
          role: UserRoles.regular,
          email: "@test",
          validityPasswordDays:10
        };
        const res = await chai.request(server).keepOpen().post("/v1/users").set("Authorization", await factory.getAdminToken()).send(user);
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("_id");
        res.body.should.have.property("username");
        res.body.should.have.property("role");
        res.body.should.have.property("validityPasswordDays");
        res.body.should.have.property("createdPassword");
        res.body.username.should.be.eql(user.username);
        res.body.validityPasswordDays.should.be.eql(user.validityPasswordDays);
      });
    
      it("it should NOT POST a user with a password too weak", async () => {
        await factory.createUser("test-user", "test-userpassword-1");
        const user = {
          username: "test-username-1",
          password: "weak",
          type: UserRoles.analyst,
          email: "@test"
        };
        const res = await chai
          .request(server)
          .keepOpen()
          .post("/v1/users")
          .set("Authorization", await factory.getAdminToken())
          .send(user);
          res.should.have.status(errors.post_request_error.status);
          res.body.should.be.a("object");
          res.body.message.should.be.a("string");
          res.should.have.status(errors.post_request_error.status);
          res.body.message.should.contain(errors.post_request_error.message);
          res.body.details.should.contain("The password strength is Too weak, please choose a stronger password");
          const user2 = {
            username: "test-username-1",
            password: "w1@",
            type: UserRoles.analyst,
            email: "@test"
          };
          const res2 = await chai
            .request(server)
            .keepOpen()
            .post("/v1/users")
            .set("Authorization", await factory.getAdminToken())
            .send(user2);
            res2.should.have.status(errors.post_request_error.status);
            res2.body.should.be.a("object");
            res2.body.message.should.be.a("string");
            res2.should.have.status(errors.post_request_error.status);
            res2.body.message.should.contain(errors.post_request_error.message);
            res2.body.details.should.contain("The password strength is Too weak, please choose a stronger password");
      });
});

// Test the /DELETE route
describe('/DELETE users', () => {
    it('it should DELETE a user', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1");
        const user_2 = await factory.createUser("test-username-2", "test-password-2");
        const users_before = await before.User.find();
        users_before.length.should.be.eql(3);
        const res = await chai.request(server).keepOpen().delete('/v1/users/' + user_1._id).set('Authorization', await factory.getAdminToken());
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.username.should.be.eql(user_1.username);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });

    it('it should not DELETE a fake user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1");
        const users_before = await before.User.find();
        users_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/users/fake_user').set('Authorization', await factory.getAdminToken());
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });
    
    it('it should not DELETE a user by non-admin', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1");
        const no_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const users_before = await before.User.find();
        users_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/users/' + user._id).set('Authorization', await factory.getUserToken(no_admin));
        res.should.have.status(errors.only_administrator.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.only_administrator.message);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });

    it('it should not DELETE a user owner of a dataset', async () => {
        const user = await factory.createUser("test-username-2", "test-password-1", UserRoles.regular);
        const dataset = await factory.createDataset("test-dataset-1", user);
        const users_before = await before.User.find();
        users_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/users/' + user._id).set('Authorization', await factory.getAdminToken());
        res.should.have.status(errors.delete_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.delete_request_error.message);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });

    it('it should not DELETE a user owner of a model', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const model = await factory.createModel("test-model-1", user);
        const users_before = await before.User.find();
        users_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/users/' + user._id).set('Authorization', await factory.getAdminToken());
        res.should.have.status(errors.delete_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.delete_request_error.message);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });

    it('it should not DELETE a user owner of a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.regular);
        const tag = await factory.createTag("test-tag", user);
        const users_before = await before.User.find();
        users_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/users/' + user._id).set('Authorization', await factory.getAdminToken());
        res.should.have.status(errors.delete_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.delete_request_error.message);
        const users_after = await before.User.find();
        users_after.length.should.be.eql(2);
    });
});

// Test the /PUT route
describe('/PUT user', () => {
    it('it should PUT a user to modify password as admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const modification = { password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/' + user._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should PUT a user to modify password as himself', async () => {      
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const modification = { password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/' + user._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should PUT a user to modify password as himself using username', async () => {      
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const modification = { password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/' + user.username).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
    
    it('it should not PUT a password to a fake user', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const modification = { password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/fake-user').set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a user with a wrong field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const modification = { username: "new_username", password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/' + user._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });

    it('it should not PUT a user as another user', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.regular);
        const other = await factory.createUser("test-username-3", "test-password-3", UserRoles.regular);
        const modification = { password: 'new_password' };
        const res = await chai.request(server).keepOpen().put('/v1/users/' + user._id).set("Authorization", await factory.getUserToken(other)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
    });
});
