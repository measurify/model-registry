const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const tenantSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply a valid name" },
    database: { type: String },
    organization: { type: String },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false },
    passwordhash: {type: Boolean, default: true, }
});

tenantSchema.set('toJSON', { versionKey: false });
tenantSchema.index({ name: 1 });
tenantSchema.plugin(paginate);
tenantSchema.plugin(require('mongoose-autopopulate'));

module.exports = tenantSchema;
