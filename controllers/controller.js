const mongoose = require('mongoose');
const persistence = require('../commons/persistence.js');
const errors = require('../commons/errors.js');

exports.getResource = async function (req, res, field, model, select) {
    try {
        if (req.query && req.query.select) select = prepareSelect(select, req.query.select);
        const item = await persistence.get(req.params.id, field, model, select);
        if (!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        return res.status(200).json(item);
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err);
    }
};

exports.getResourceList = async function (req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        if(query.select) select = prepareSelect(select, query.select);
        let list = await persistence.getList(query.filter, query.sort, select, query.page, query.limit, restriction, model);
        return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.getResourceListSize = async function (req, res, model, restriction) {
    try {
        const query = req.query;
        const size = await persistence.getSize(query.filter, restriction, model);
        return res.status(200).json({ size: size });
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.postResource = async function (req, res, model) {
    try {
        if (req.user._id) req.body.owner = req.user._id;
        if (!req.query.verbose) req.query.verbose = 'true';
        const results = await persistence.post(req.body, model, req.tenant);
        req.result = results;
        if (req.body.constructor != Array) return res.status(200).json(results);
        else {
            if (req.query.verbose == 'true') {
                if (results.errors.length === 0) { return res.status(200).json(results); }
                else { return res.status(202).json(results); }
            }
            else {
                const items = model.modelName.toLowerCase() + 's';
                if (results.errors.length === 0) { return res.status(200).json({ saved: results[items].length, errors: results.errors.length }); }
                else { return res.status(202).json({ saved: results[items].length, errors: results.errors.length, Indexes: results.errors }); }
            }
        }
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.deleteResource = async function (req, res, model) {
    try {
        const result = await persistence.delete(req.params.id, model);
        if (!result) return errors.manage(res, errors.resource_not_found, req.params.id);
        else return res.status(200).json(result);
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.delete_request_error, err);
    }
}

exports.deleteResourceList = async function (req, res, model, restriction) {
    try {
        const result = await persistence.deletemore(req.query.filter, restriction, model);
        if (result == 0) return errors.manage(res, errors.resource_not_found);
        else return res.status(200).json({ deleted: result });
    }
    catch (err) { return errors.manage(res, errors.delete_request_error, err); }
}

exports.updateResource = async function (req, res, fields, model) {
    try {
        const modified_resource = await persistence.update(req.body, fields, req.resource, model, req.tenant);
        return res.status(200).json(modified_resource);
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }
};

//local function
const prepareSelect = function (select, querySelect) {
    try {
        querySelect = JSON.parse(querySelect);
    } catch (e) {
        return select;
    }
    let object = {};
    if (select !== null) {
        querySelect.map((key) => {
            if (select[key] === undefined) object[key] = true;
        });
        if (object !== {}) return object;
        return select;
    }
    const notVisible=["timestamp", "lastmod", "__v", "password"];
    querySelect.map((key) => {
        if (!notVisible.includes(key)) object[key] = true;
    });
    if (object !== {}) return object;
    return null;
}
