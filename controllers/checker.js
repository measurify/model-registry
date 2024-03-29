const mongoose = require('mongoose');
const errors = require('../commons/errors.js');
const authorizator = require('../security/authorization.js');

exports.isTenantAvailable = async function (req, res) {
    try {
        const Tenant = mongoose.dbs['catalog'].model('Tenant');
        const item = await authorizator.isAvailable(req.tenat, null, Tenant);
        if (!item) return errors.manage(res, errors.resource_not_found, req.tenat);
        req.tenant._id = item;
        return true;
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err);
    }
}

exports.isAvailable = async function (req, res, model) {
    try {
        const item = await authorizator.isAvailable(req.params.id, null, model);
        if (!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        req.resource = item;
        return true;
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err);
    }
}

exports.isContained = async function (req, res, resource_field, key, value) {
    try {
        const list = req.resource[resource_field];
        const item = list.find(element => { return element[key] == value });
        if (!item) return errors.manage(res, errors.resource_not_found, value);
        req.element = item;
        return true;
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
}

exports.isAlreadyContained = async function (req, res, resource_field, key, value) {
    try {
        const list = req.resource[resource_field];
        const item = list.find(element => { return element[key] == value });
        if (item) return errors.manage(res, errors.generic_request_error, "element already exists");
        return true;
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
}

exports.isFilled = async function (req, res, values) {
    const body = req.body;
    if (!body) return errors.manage(res, errors.missing_info);
    if (Object.keys(body).length === 0) return errors.manage(res, errors.missing_info);
    if (!values.some(function (element) {
        if (body[element] == null) return false;
        else if (Array.isArray(body[element])) if (body[element].length == 0) return false;
        return true;
    })) return errors.manage(res, errors.incorrect_info);
    return true;
}

exports.isNotUsed = async function (req, res, model, field) {
    const result = await authorizator.isNotUsed(req.resource, model, field);
    if (result != true) return errors.manage(res, errors.delete_request_error, result);
    return true;
}

exports.isAdministrator = async function (req, res) {
    if (!authorizator.isAdministrator(req.user)) return errors.manage(res, errors.only_administrator);
    return true;
}

exports.isHim = async function (req, res) {
    if (!authorizator.isHim(req.resource, req.user)) return errors.manage(res, errors.put_request_error, req.resource._id);
    return true;
}

exports.isOwned = async function (req, res) {
    if (!authorizator.isOwner(req.resource, req.user)) return errors.manage(res, errors.not_yours, req.resource._id);
    return true;
}

exports.canCreate = async function (req, res) {
    if (!authorizator.canCreate(req.user)) return errors.manage(res, errors.restricted_access_create, "You cannot create new resources");
    return true;
}

exports.canRead = function (req, res) {
    if (!authorizator.canRead(req.resource, req.user)) return errors.manage(res, errors.restricted_access_read, req.resource._id);
    return true;
}

exports.canModify = async function (req, res) {
    if (!authorizator.canModify(req.resource, req.user)) return errors.manage(res, errors.restricted_access_modify, req.resource._id);
    return true;
}

exports.canDelete = async function (req, res) {
    if (!authorizator.canDelete(req.resource, req.user)) return errors.manage(res, errors.restricted_access_delete, req.resource._id);
    return true;
}

exports.canDeleteList = async function (req, res) {
    if (!authorizator.canDeleteList(req.user)) return errors.manage(res, errors.restricted_access_delete);
    return true;
}

exports.whatCanRead = async function (req, res) {
    return authorizator.whatCanRead(req.user);
}

exports.isValid = async function (req, res, type, field) {
    const value = req.body[field];
    if (!value) return true;
    if (!Object.values(type).includes(value)) return errors.manage(res, errors.unknown_value, value);
    return true;
}

exports.createOrdinal = async function (req, res) {//req.resource==item;req.query.ordinal=User Input
    if (req.query && req.query.ordinal !== undefined && req.query.ordinal !== "" && req.query.ordinal !== " ") {
        if (req.resource.versions) {
            const el = req.resource.versions.find(element => { return element.ordinal == req.query.ordinal });
            if (el) { return errors.manage(res, errors.post_request_error, "Ordinal value duplicated: " + req.query.ordinal + " , Please choose another value or let default incremental choice"); }
            else { req.ordinal = req.query.ordinal; return true; }
        }
        else { req.ordinal = req.query.ordinal; return true; }
    }
    if (!req.resource.versions || req.resource.versions.length === 0) { req.ordinal = 1; return true; }
    let ordinals = req.resource.versions.map(element => { return element.ordinal });
    /*OLD check all ordinals and give an empty position in the list
    ordinals=cleanArrayOrdinal(ordinals);
    let maxN=Math.max(...ordinals);
    if( maxN === ordinals.length){ req.ordinal = maxN+1; return true;}
    for(let i=0;i<maxN;i++){
        if(i+1!=ordinals(i)){
            req.ordinal=i+1
            break;
        }
    } */
    //NEW CHECK THE MAX AND +1 and     
    ordinals = ordinals.map(e => parseFloat(e)).filter(e => isNaN(e) === false);
    let maxN = Math.max(...ordinals);
    req.ordinal = Math.floor(maxN + 1);
    return true;
}

/*
function cleanArrayOrdinal(array) {
    array = array.filter(element => ( element >= 1 && element % 1 == 0 ) );    
    return array.sort((a,b) => a-b)
}
*/