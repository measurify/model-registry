const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise; 

const fileSchema = new mongoose.Schema({
    key: { type: String, required: true },
    original: { type: String, required: true },
    encoding: { type: String, required: true }, 
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }},
    { _id: false }  
);

module.exports = fileSchema;