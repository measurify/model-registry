const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const UsageTypes = require('../types/usageTypes.js'); 

const metadataSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    usage: {type: String, enum: UsageTypes, default: UsageTypes.folk },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    timestamp: { type: Date, default: Date.now, select: false }
});

metadataSchema.set('toJSON', { versionKey: false });
metadataSchema.index({ owner: 1 });
metadataSchema.plugin(paginate);
metadataSchema.plugin(require('mongoose-autopopulate'));

// validate owner
metadataSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate id
metadataSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Metadata validation failed: the _id is already used (' + this._id + ')');
});

module.exports = metadataSchema;
