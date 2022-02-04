const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const authentication = require('../security/authentication.js');
const errors = require('../commons/errors.js');

exports.post = async (req, res) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) return errors.manage(res, errors.authentication_error, info);
        req.login(user, {session: false}, (error) => {
            const user_info = Object.assign({}, user._doc);
            const token_expiration_time = process.env.JWT_EXPIRATIONTIME;
            delete user_info.password;
            delete user_info.__v;
            return res.status(200).json({ user: user_info, token_expiration_time: token_expiration_time, token: authentication.encode(user, req.tenant)});
        });
    })(req, res, function(error) { return errors.manage(res, errors.internal_server_error, error) });
};

exports.put = async (req, res) => {
    passport.authenticate('jwt-renew', {session: false}, (err, user, info) => {
        if (err || !user) return errors.manage(res, errors.authentication_error, info);
        req.login(user, {session: false}, (error) => {
            const user_info = Object.assign({}, user._doc);
            const token_expiration_time = process.env.JWT_EXPIRATIONTIME;
            delete user_info.password;
            delete user_info.status;
            delete user_info.__v;
            return res.status(200).json({ user: user_info, token_expiration_time: token_expiration_time, token: authentication.encode(user, req.tenant)});
        });
    })(req, res, function(error) { return errors.manage(res, errors.internal_server_error, error) });
};

  

