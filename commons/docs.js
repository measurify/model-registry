const underscore = require('underscore');
const mongoose = require('mongoose');   
 
const nestedSchemas = [];

function generateSchemaDocs() {
    let schemas = underscore.pairs(mongoose.modelSchemas);
    schemas = underscore.map(schemas, function (schema) { return getSchemaInfo(schema); });
    schemas = schemas.concat(nestedSchemas);
    return schemas;
}

function getSchemaInfo(schema) {
    let paths = underscore.map(schema[1].paths, function (path) {
        const info = getFieldInfo(path);
        if (info && info.schema) nestedSchemas.push(info.schema);
        return info;    
    });
    underscore.each(schema.virtuals, function (virtual) {
        if (virtual.path != "id")
            paths.push({name: virtual.path, type: "Unknown"});
    });
    paths = paths.filter(item => item.name !== '__v');
    paths = paths.filter(item => item.name !== 'timestamp');
    paths = paths.filter(item => item.name !== 'lastmod');
    return {name: schema[0], fields: paths};
}

function getSubSchemaInfo(schema) {
    let paths = underscore.map(schema.paths, function (path) {
        const info = getFieldInfo(path);
        return info;    
    });
    paths = paths.filter(item => item.name !== '__v');
    paths = paths.filter(item => item.name !== 'timestamp');
    paths = paths.filter(item => item.name !== 'lastmod');
    let sub = '';
    for(path of paths) {
        sub += '{ name:' +  path.name + '; type:' + path.type;
        if(path.enumValues) sub += ' [' + path.enumValues + ']';
        sub += ' }';
    };
    return sub;
}

function getFieldInfo(path) {
    const field = {name: path.path, type: path.instance};
    if (path.options.type) {
        field.type = path.options.type.name;
        if (path.options.type instanceof Array && !path.schema) field.type = path.options.type[0].name + " []";
        if (path.options.ref) field.type += ' -> (' + path.options.ref + ')';
    }
    field.min = path.options.min;
    field.max = path.options.max;
    if (path.enumValues && path.enumValues.length > 0)
        field.enumValues = path.enumValues;
    if (path.schema) {
        field.type = field.name + ' (' + getSubSchemaInfo(path.schema) + ')';
    }
    if (path.isRequired)
        field.required = true;
    return field;
}

function split (thing) {
    if (typeof thing === 'string') { return thing.split('/'); } 
    else if (thing.fast_slash) { return ''; } 
    else {
      let match = thing.toString().replace('\\/?', '').replace('(?=\\/|$)', '$').match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
      return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>'
    }
}

exports.create = function(app){
    let routes = [];
    let schemas = [];
    
    function print (path, layer) {
        if (layer.route) { layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path)))) } 
        else if (layer.name === 'router' && layer.handle.stack) { layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp)))) } 
        else if (layer.method) { routes.push({ path:path.concat(split(layer.regexp)).filter(Boolean).join('/'), method: layer.method.toUpperCase() }); }
    }
    
    try {
        app._router.stack.forEach(print.bind(null, []))
        routes = underscore.groupBy(routes, function (route) { return route.path.split("/")[1]; });
        delete routes['undefined'];
        routes = underscore.pairs(routes);
        routes = routes.sort();

        schemas = generateSchemaDocs(mongoose);
        schemas.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        
        return { routes: routes, schemas: schemas };
    } 
    catch (e) { console.log(e) }
};
