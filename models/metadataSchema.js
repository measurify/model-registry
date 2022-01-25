const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    value: { type: String, required: "Please, supply a value" }, },
    { _id: false }  
);

module.exports = metadataSchema;