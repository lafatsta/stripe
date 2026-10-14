/* Main entry point to stripe-ecommerce-app to run on commandline */
var express = require('express')
var app = express()
var constants = require('./constants')
var mongoose = require('mongoose')
var setupController = require('./controllers/setupController')
var apiController = require('./controllers/apiController')
var session = require('express-session')
var port = process.env.PORT || 8181

/* Use AWS Secrets Manager to secure mongoDBConnectionString instead of exposing it in constants/index.js */
var awssecrets = require('./aws/aws-secrets')

awssecrets
  .handler()
  .then(async data => {
    await mongoose.connect(data.secrets.mongoDBConnectionString)
    console.log('✅ MongoDB connected')
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  })

// Trust the first reverse proxy so Express can correctly detect HTTPS
// when deployed behind a load balancer, ALB, Heroku, Render, etc.
app.set('trust proxy', 1)

// Ensure session cookie options exist.
if (!constants.sessionOptions.cookie) {
  constants.sessionOptions.cookie = {}
}

// Require HTTPS for the session cookie in every environment.
constants.sessionOptions.cookie.httpOnly = true
constants.sessionOptions.cookie.secure = true
constants.sessionOptions.cookie.sameSite = 'lax'

app.use(session(constants.sessionOptions))
app.set('view engine', 'pug')
app.use(express.static('public'))

setupController(app)
apiController(app)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
