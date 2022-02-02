
const mongoose = require('mongoose');
const checker = require('./checker');
const errors = require('../commons/errors.js');

exports.addTags = async function(req, res) {
    let tags = [];
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    try { 
        if(!req.body.tags) return true;
        if(req.body.tags.add) tags = req.body.tags.add;
        else tags = req.body.tags
        if(tags == 0) return true;

        for (element of tags) {
            const tag_req = { _id: element , owner: req.user}
            const tag = new Tag(tag_req);
            try { await tag.save()} catch(err) {};
        }
        return true;
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.addMetadata = async function(req, res) {
    let metadatas = [];
    const Metadata = mongoose.dbs[req.tenant.database].model('Metadata');
    try { 
        if(!req.body.metadata) return true;
        if(req.body.metadata.add) metadatas = req.body.metadata.add;
        else metadatas = req.body.metadata
        if(metadatas == 0) return true;

        for (element of metadatas) {
            const metadata_req = { _id: element.name , owner: req.user}
            const metadata = new Metadata(metadata_req);
            try { await metadata.save()} catch(err) {};
        }
        return true;
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}