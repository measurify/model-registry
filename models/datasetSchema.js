const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise; 

const metadataSchema = require('./metadataSchema.js');
const fileSchema = require('./fileSchema.js');
const ModelStatusTypes = require('../types/modelStatusTypes.js'); 
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const datasetSchema = new mongoose.Schema({
    name: { type: String, required: "Please, supply a valid name" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [ { type: mongoose.Schema.Types.ObjectId, ref:'User', autopopulate: true } ],
    versions: [ fileSchema ],
    metadata: [ metadataSchema ],
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    tags: { type: [String], ref: 'Tag' },
    timestamp: { type: Date, default: Date.now }
});

datasetSchema.set('toJSON', { versionKey: false });
datasetSchema.index({ owner: 1 });
datasetSchema.plugin(paginate);
datasetSchema.plugin(require('mongoose-autopopulate'));

// validate tags
datasetSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        for (let value of values) {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error('Tag not existent (' + value + ')');
        };
        return true;
    }
});

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