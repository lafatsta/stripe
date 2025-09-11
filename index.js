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




// Ensure cookies are only sent over HTTPS in production
if (!constants.sessionOptions.cookie) constants.sessionOptions.cookie = {};
constants.sessionOptions.cookie.secure = process.env.NODE_ENV === 'production';
app.use(session(constants.sessionOptions));
app.set('view engine', 'pug');
app.use(express.static('public'));


setupController(app);
apiController(app);

app.listen(port);
