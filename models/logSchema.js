const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
 
const logSchema = new mongoose.Schema({ 
    date: { type: Date, default: Date.now() },
    log: { type: String }    
}, /*{ capped: { size: 1000000, max: 10000, autoIndexId: true } }*/);

logSchema.set('toJSON', { versionKey: false });
logSchema.index({ owner: 1 });
logSchema.plugin(paginate);
logSchema.plugin(require('mongoose-autopopulate'));

module.exports = logSchema;