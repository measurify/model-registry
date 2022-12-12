const fs = require('fs').promises;
const errors = require('../commons/errors.js');
const path = require('path');

exports.delete = async function(filename) {
    try { await fs.unlink(process.env.UPLOAD_PATH + '/' + filename); } 
    catch (error) { console.log('File delete error: ' + error); }
}

exports.download = async function (req, res) {
    if(!req.element.key) return errors.manage(res, errors.generic_download_error, "Missing filename");
    const filename = await path.join(process.env.UPLOAD_PATH, req.element.key);
    if (!await fs.stat(filename)) return errors.manage(res, errors.generic_download_error, "File not found!");
    res.setHeader('Content-type', req.element.mimetype);
    return res.download(filename,req.element.original);
}