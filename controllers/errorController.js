const mongoose = require('mongoose');
const errors = require('../commons/errors');

exports.get = async (req, res) => {
    return res.status(200).json(errors);
};