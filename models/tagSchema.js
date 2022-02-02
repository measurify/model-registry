const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const UsageTypes = require('../types/usageTypes.js'); 

const tagSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    usage: {type: String, enum: UsageTypes, default: UsageTypes.folk },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    timestamp: { type: Date, default: Date.now, select: false }
});

tagSchema.set('toJSON', { versionKey: false });
tagSchema.index({ owner: 1 });
tagSchema.plugin(paginate);
tagSchema.plugin(require('mongoose-autopopulate'));

// validate owner
tagSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate id
tagSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Tag validation failed: the _id is already used (' + this._id + ')');
});

module.exports = tagSchema;
