/*Main entry point to stripe-ecommerce-app to run on commandline*/
var express = require('express');
var app = express();
var constants = require('./constants');
var mongoose = require('mongoose');
var setupController = require('./controllers/setupController');
var apiController = require('./controllers/apiController');
var session = require('express-session');
var port = process.env.PORT || 8181;


/* Using AWS Secrets Manager to secure stripe_sk instead of exposed in code/configurations*/
var awssecrets = require('./aws/aws-secrets');
awssecrets.handler().then(function (data) {
    mongoose.connect(data.secrets.dbConnection, { useNewUrlParser: true, useUnifiedTopology: true });
});




// Ensure session cookies are always initialized and secure by default
if (!constants.sessionOptions.cookie) {
    constants.sessionOptions.cookie = {};
}

// Always set httpOnly for defense in depth
constants.sessionOptions.cookie.httpOnly = true;

// Enforce secure cookies in production; allow insecure cookies only for explicit localhost dev
if (process.env.NODE_ENV === 'production') {
    // In production, cookies must only be sent over HTTPS
    constants.sessionOptions.cookie.secure = true;
} else if (
    process.env.ALLOW_INSECURE_COOKIES === '1' &&
    (process.env.HOST === 'localhost' || process.env.HOST === '127.0.0.1' || process.env.HOST === undefined)
) {
    // Explicitly allow insecure cookies for local development only
    constants.sessionOptions.cookie.secure = false;
    console.warn('Warning: Insecure cookies are enabled ONLY for localhost development. Session cookies are NOT secure and can be intercepted. Never use this setting in production or on public servers.');
} else {
    // Fail fast if configuration could lead to insecure cookies outside localhost dev
    console.error('ERROR: Insecure cookies are not allowed. For local development only, set ALLOW_INSECURE_COOKIES=1 and HOST=localhost in your environment variables. Never do this in production or on a public host.');
    process.exit(1);
}

app.use(session(constants.sessionOptions));
app.set('view engine', 'pug');
app.use(express.static('public'));


setupController(app);
apiController(app);

app.listen(port);
