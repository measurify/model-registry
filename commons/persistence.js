const mongoose = require('mongoose');
const broker = require('../commons/broker.js');
const tenancy = require('../commons/tenancy.js');
const factory = require('../commons/factory.js');
const bcrypt = require('bcryptjs');
const { passwordStrength } = require('check-password-strength');

exports.get = async function(id, field, model, select) {
    try {
        let item = null;
        if (!select) select = {};
        if(field) item = await model.findOne({ [field]: id }).select(select);
        if(!item) item = await model.findById(id).select(select);
        if(!item) return null;
        return item;
    }
    catch(err) { return null; }
};

exports.getOne = async function(filter, model, select) {
    try {
        let item = null;
        if (!select) select = {};
        if(filter) item = await model.findOne(filter).select(select);
        if(!item) return null;
        return item;
    }
    catch(err) { return null; }
};

exports.getSize = async function(filter, restriction, model) {
    if (!filter) filter = '{}';
    filter = prepareFilter(filter, restriction);
    const size = await model.countDocuments(filter);
    return size;
}

exports.getList = async function(filter, sort, select, page, limit, restriction, model) {
    if (!page) page = '1';
    if (!limit) limit = '10';
    if (!filter) filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = {};
    filter = prepareFilter(filter, restriction);
    const options = {
        select: select,
        sort: JSON.parse(sort),
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const list = await model.paginate(filter, options);
    return list;
}

const postOne = async function(body, model, tenant) {
    if (body.password) body.password = checkPassword(body.password,tenant.passwordhash);
    const resource = await (new model(body)).save();
    if(model.modelName == 'Model') { broker.publish('model-' + body._id, body._id, body); }
    if(model.modelName == 'Tenant') { await tenancy.init(resource, body.admin_username, body.admin_password); }
    return resource;
}

const postList = async function(body, model, tenant) { 
    const items = model.modelName.toLowerCase() + 's';
    const results = { [items]: [], errors: [] };
    for (let [i, element] of body.entries()) {
        try {
            element.owner = body.owner;
            if (element.password) element.password = checkPassword(element.password,tenant.passwordhash);
            const resource = await (new model(element)).save()
            if(model.modelName == 'Model') { broker.publish('model-' + body._id, body._id, body); }
            if(model.modelName == 'Tenant') { await tenancy.init(resource, body.admin_username, body.admin_password); }
            results[items].push(resource);
        }
        catch (err) { results.errors.push('Index: ' + i +  ' (' + err.message + ')'); }
    }
    return results;     
};

exports.post = async function(body, model, tenant) {
    if (body.constructor == Array) return await postList(body, model, tenant);
    return await postOne(body, model, tenant);
}

exports.delete = async function(id, model) {  
    const result = await model.findOneAndDelete({ _id: id });
    if (!result) return null;
    return result;
}

exports.update = async function(body, fields, resource, model, tenant) {
    for (let field in body) if(!fields.includes(field)) throw 'Request field cannot be updated (' + field + ')';
    for (let field of fields) {
        if (typeof body[field] != 'object' && body[field]) {
            if(field == 'password') if(tenant.passwordhash == true) body[field] = bcrypt.hashSync(body[field], 8);
            resource[field] = body[field]; 
            continue; 
        }
        if (typeof body[field] == 'object' && body[field]) {
            do {
                let result = null;

                // List of resources
                let field_model = null;
                const field_model_name = field[0].toUpperCase() + field.slice(1, -1);
                try { if (tenant) field_model = await mongoose.dbs[tenant.database].model(field_model_name) } catch(err) {};
                if (field_model) result = await modifyResourceList(body[field], field_model, resource, field);
                if (result == true) break;
                else if (result) throw result;
            
                // List of categorical data
                let field_type = null;
                const field_type_name = field[0].toUpperCase() + field.slice(1) + "Types";
                try { field_type = require('../types/' + field_type_name + '.js'); } catch(err) {};
                if (field_type) result = await modifyCategoricalValueList(body[field], field_type, resource, field);
                if (result == true) break;
                else if (result) throw result;

                // List of generic objects
                let key = 'name';
                if(body.versions) key = 'ordinal';
                result = await modifyObjectValueList(body[field], resource, field, key);
                if (result == true) break;
                else if (result) throw result;

                // Other lists? TBD
                throw 'Cannot manage the field (' + field + ')';
                break;
            } while(true);
            continue;
        }
    } 
    resource.lastmod = Date.now();
    const modified_resource = await model.findOneAndUpdate({_id: resource._id}, resource, { new: true });
    return modified_resource;
}

exports.deletemore = async function(filter, restriction, model) {  
    if (!filter) filter = '{}'; 
    filter = prepareFilter(filter, restriction);
    const result = await model.deleteMany(filter);
    return result.n;
}

// local functions 

const prepareFilter = function(filter, restriction) {
    if(filter.charAt( 0 ) == '[') filter = '{ "$or":' + filter + '}'; 
    let object = JSON.parse(filter);
    if(restriction) { 
        if(object.$and) object.$and.push(restriction);
        else object = { $and: [ object, restriction ] };
    }
    return object;
}

const modifyResourceList = async function(list, model, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!await model.findById(value)) throw 'Resource to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.some(item => item == value._id));
        resource[field] = resource[field].filter(value => !list.remove.some(item => item == value));
    }
    if(list.add) {
        for (let value of list.add) { if (!await model.findById(value))  throw 'Resource to be added to the list not found: ' + value; };
        for (let value of list.add) { if (!resource[field].some(item => item._id == value) &&
                                          !resource[field].some(item => item == value) ) resource[field].push(value) };
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const modifyCategoricalValueList = async function(list, type, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!Object.values(type).includes(value)) throw 'Type to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if(list.add) {
        for (let value of list.add) { if (!Object.values(type).includes(value))  throw 'Type to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}
 
const modifyObjectValueList = async function(list, resource, field, key) {
    if(list.remove) { resource[field] = resource[field].filter(value => !list.remove.some(item => item[key] == value[key])); }
    if(list.add) { for (let value of list.add) { if (!resource[field].some(item => item[key] == value[key])) resource[field].push(value) }; }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const checkPassword = function (password,passwordhash) {
    const details = passwordStrength(password);
    if (details.id < process.env.MIN_PASSWORD_STRENGTH) throw new Error('The password strength is ' + details.value + ', please choose a stronger password');//MIN_PASSWORD_STRENGTH:0=TOO WEAK; 1=WEAK; 2=MEDIUM; 3=STRONG
    if (passwordhash === false || passwordhash === 'false') return password;
    return bcrypt.hashSync(password, 8);
}