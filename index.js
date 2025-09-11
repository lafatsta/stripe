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

// Always set httpOnly for defense in depth; secure attribute only overridden in dev
constants.sessionOptions.cookie.httpOnly = true;

if (process.env.NODE_ENV === 'production') {
    constants.sessionOptions.cookie.secure = true;
} else if (process.env.ALLOW_INSECURE_COOKIES === '1') {
    constants.sessionOptions.cookie.secure = false;
    console.warn('Warning: Session cookies are NOT marked as secure. This is only safe for local development and should NOT be used in production!');
} else {
    console.error('ERROR: Insecure cookies are not allowed. To run in development without HTTPS, set ALLOW_INSECURE_COOKIES=1 in your environment variables (never do this in production).');
    process.exit(1);
}

app.use(session(constants.sessionOptions));
app.set('view engine', 'pug');
app.use(express.static('public'));


setupController(app);
apiController(app);

app.listen(port);
