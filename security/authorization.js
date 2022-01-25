
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const persistence = require('../commons/persistence.js');

exports.isAdministrator = function(user) {
    if (user.role == UserRoles.admin) return true;
    else return false;
}

exports.isOwner = function(resource, user) {
    if(this.isAdministrator(user)) return true;
    return resource.owner._id.equals(user._id); 
}

exports.isHim = function(resource, user) {
    if(this.isAdministrator(user)) return true;
    return resource._id.equals(user._id); 
}

exports.isAvailable = async function(id, field, model) {
    let item = await persistence.get(id, field, model);
    if(!item && model.modelName == 'User') item = await persistence.get(id, 'username', model); 
    if(!item) return null; 
    return item;
}

exports.isNotUsed = async function(resource, model, field) {
    let references = [];
    if(model.schema.path(field).instance === 'Array') references = await model.find({ [field] : { $elemMatch : {$in: [resource._id]}  } }).limit(1);
    else references = await model.find({ [field]: resource._id }).limit(1);
    if (references.length != 0) return 'Used in ' + references[0]._id + ' ' + model.modelName;
    return true;
} 

exports.isShared = function(resource, user) {
    if(!resource.users) return false;
    user_ids = resource.users.map(user => user._id);
    if(user_ids.includes(user._id)) return true;
    return false;
} 

exports.canCreate = function(user) {
    return true;
}

exports.canRead = function(resource, user) {
    if(resource.visibility && resource.visibility == VisibilityTypes.public) return true;
    if (this.isAdministrator(user)) return true;
    if (this.isOwner(resource, user)) return true;
    if (this.isShared(resource, user)) return true;
    return false;
} 

exports.canModify = function(resource, user) {
    if (this.isAdministrator(user)) return true;
    if (this.isOwner(resource, user)) return true;
    return false;
} 

exports.canDelete = function(resource, user) {
    if (this.isAdministrator(user)) return true;
    if (this.isOwner(resource, user)) return true;
    return false;
} 

exports.whatCanRead = function(user) {
    if (this.isAdministrator(user)) return { };
    else return { $or: [  { owner: user._id }, { users: {"$in": [user._id]} }, { visibility: VisibilityTypes.public } ] };
} 

exports.whatCanDelete = function(user) {
    if (this.isAdministrator(user)) return null;
    else return { owner: user._id };
} 