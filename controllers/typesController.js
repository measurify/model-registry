const fs = require('fs');

exports.get = async (req, res) => { 
    const types = {};
    const types_files = await fs.readdirSync('./types/');
    for(let i=0; i<types_files.length; i++) {
        const type = require('../types/' + types_files[i]);
        const type_name = types_files[i].substring(0, 1).toUpperCase() + types_files[i].substring(1, types_files[i].length - 3);
        types[type_name] = type;
    }
    return res.status(200).json(types);    
};

