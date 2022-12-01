const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise; 

const fileSchema = require('./fileSchema.js');
const ModelStatusTypes = require('../types/modelStatusTypes.js'); 
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const metadataValueSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    value: { type: String, required: "Please, supply a value" }, },
    { _id: false }  
);

const modelSchema = new mongoose.Schema({
    name: { type: String, required: "Please, supply a valid name" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [ { type: mongoose.Schema.Types.ObjectId, ref:'User', autopopulate: true } ],
    datasets: [ { type: mongoose.Schema.Types.ObjectId, ref:'Dataset', autopopulate: true } ],
    versions: [ fileSchema ],
    status: {type: String, enum: ModelStatusTypes, default: ModelStatusTypes.training },
    metadata: [ metadataValueSchema ],
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    tags: { type: [String] },
    timestamp: { type: Date, default: Date.now }
});

modelSchema.set('toJSON', { versionKey: false });
modelSchema.index({ owner: 1 });
modelSchema.plugin(paginate);
modelSchema.plugin(require('mongoose-autopopulate'));

// validate users
modelSchema.path('users').validate({
    validator: async function (values) {
        const User = this.constructor.model('User');
        for (let value of values) {
            const user = await User.findById(value);
            if (!user) throw new Error('User not existent (' + value + ')');
        };
        return true;
    }
});

// validate datasets
modelSchema.path('datasets').validate({
    validator: async function (values) {
        const Dataset = this.constructor.model('Dataset');
        for (let value of values) {
            const dataset = await Dataset.findById(value);
            if (!dataset) throw new Error('Dataset not existent (' + value + ')');
        };
        return true;
    }
});

// validate owner
modelSchema.path('owner').validate({
    validator: async function (value) {      
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) throw new Error('Owner not existent (' + value + ')');
        return true;
    }
});

// validate versions
modelSchema.path('versions').validate({
    validator: async function (values) {  
        let ordinalValues=[]; 
        for(let i=0; i<values.length; i++) {
            if(ordinalValues.includes(values[i].ordinal.toLowerCase())){
                throw new Error('Model validation failed: version ordinal duplicated (' + values[i].ordinal.toLowerCase() + ')');
            }
            ordinalValues.push(values[i].ordinal.toLowerCase());            
        };
        return true;
    }
});

// check if already have a similar model (idempotent)
// same name and same owner
modelSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { owner: this.owner, name: this.name });
    if(res) throw new Error('A model with the same name already exists for this user');                       
});

module.exports = modelSchema;