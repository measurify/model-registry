const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise; 
const fileSchema = require('./fileSchema.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const metadataValueSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    value: { type: String, required: "Please, supply a value" }, },
    { _id: false }  
);

const datasetSchema = new mongoose.Schema({
    name: { type: String, required: "Please, supply a valid name" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [ { type: mongoose.Schema.Types.ObjectId, ref:'User', autopopulate: true } ],
    versions: [ fileSchema ],
    metadata: [metadataValueSchema],
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    tags: { type: [String] },
    timestamp: { type: Date, default: Date.now }
});

datasetSchema.set('toJSON', { versionKey: false });
datasetSchema.index({ owner: 1 });
datasetSchema.plugin(paginate);
datasetSchema.plugin(require('mongoose-autopopulate'));

// validate users
datasetSchema.path('users').validate({
    validator: async function (values) {
        const User = this.constructor.model('User');
        for (let value of values) {
            const user = await User.findById(value);
            if (!user) throw new Error('User not existent (' + value + ')');
        };
        return true;
    }
});

// validate owner
datasetSchema.path('owner').validate({
    validator: async function (value) {      
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) throw new Error('Owner not existent (' + value + ')');
        return true;
    }
});

// check if already have a similar model (idempotent)
// same name and same owner
datasetSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { owner: this.owner,
                                                  name: this.name
                                                 });
    if(res) throw new Error('A dataset with the same name already exists for this user');                       
});

module.exports = datasetSchema;