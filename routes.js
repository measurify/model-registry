const express = require('express');
const router = express.Router();
const passport = require('passport');

// login
const loginRoute = require('./routes/loginRoute');
router.use('/' + process.env.VERSION + '/login', loginRoute);

// demo
if (process.env.DEMO === 'true') {
    const demoRoute = require('./routes/demoRoute');
    router.use('/' + process.env.VERSION + '/demo', passport.authenticate('jwt-token', {session: false}), demoRoute);
}

// tenants
const tenantRoute = require('./routes/tenantRoute');
router.use('/' + process.env.VERSION + '/tenants', passport.authenticate('api-token', {session: false}), tenantRoute);

// log
const logRoute = require('./routes/logRoute');
router.use('/' + process.env.VERSION + '/log', passport.authenticate('jwt-token', {session: false}), logRoute);

// docs
const errorRoute = require('./routes/docsRoute');
router.use('/' + process.env.VERSION + '/docs', errorRoute);

// errors
const docsRoute = require('./routes/errorRoute');
router.use('/' + process.env.VERSION + '/errors', docsRoute);

// user
const userRoute = require('./routes/userRoute');
router.use('/' + process.env.VERSION + '/users', passport.authenticate('jwt-token', {session: false}), userRoute);

// tag
const tagsRoute = require('./routes/tagRoute');
router.use('/' + process.env.VERSION + '/tags', passport.authenticate('jwt-token', {session: false}), tagsRoute);

// metadata
const metadataRoute = require('./routes/metadataRoute');
router.use('/' + process.env.VERSION + '/metadata', passport.authenticate('jwt-token', {session: false}), metadataRoute);

// datasets
const datasetsRoute = require('./routes/datasetRoute');
router.use('/' + process.env.VERSION + '/datasets', passport.authenticate('jwt-token', {session: false}), datasetsRoute);

// models
const modelsRoute = require('./routes/modelRoute');
router.use('/' + process.env.VERSION + '/models', passport.authenticate('jwt-token', {session: false}), modelsRoute);

// algorithms
const algorithmsRoute = require('./routes/algorithmRoute');
router.use('/' + process.env.VERSION + '/algorithms', passport.authenticate('jwt-token', {session: false}), algorithmsRoute);

// type
const typesRoute = require('./routes/typeRoute');
router.use('/' + process.env.VERSION + '/types', typesRoute);

// info 
const infoRoute = require('./routes/infoRoute');
router.use('/' + process.env.VERSION + '/info', passport.authenticate('jwt-token', {session: false}), infoRoute);

module.exports = router;
