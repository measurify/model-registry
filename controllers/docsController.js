const docs = require('../commons/docs');

exports.get = async (req, res) => {
    const doc = docs.create(req.app);
    return res.status(200).json(doc);
};