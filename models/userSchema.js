const mongoose = require('mongoose');
const UserRoles = require('../types/userRoles.js');

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    password: { type: String, required: true, select: false },
    createdPassword: {type: Date, default: Date.now },
    validityPasswordDays: {type: Number, default: process.env.DEFAULT_DAYS_VALIDITY_PASSWORD },
    email: { type: String, required: "Please, supply an email",index: true },
    role: { type: String, enum: UserRoles, required: true },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

userSchema.set('toJSON', { versionKey: false });

userSchema.plugin(require('mongoose-autopopulate'));
userSchema.plugin(require('mongoose-paginate-v2'));

// check if already exists a similar user (idempotent): same username
userSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { username: this.username });
    if(res) throw new Error('User validation failed: a user with the same username already exists (' + this.username + ')');                       
});

// check role
userSchema.pre('save', async function() {
    if(!this.role) throw new Error('User validation failed: please specify the user role');  
    if(!Object.values(UserRoles).includes(this.role)) throw new Error('User validation failed: unrecognized role');                      
});

//check email duplicated
userSchema.pre('save', async function() {
    let res = await this.constructor.findOne( { email:this.email});                                             
    if(res) throw new Error('The email '+this.email+' already exists');                       
});

module.exports = userSchema;
