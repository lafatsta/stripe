/*
 *Constants to keep consisitency of labels/terms/variables across stripe-ecommerce-app
 */

var cart = require('../models/cartModel')

module.exports = {
  title: 'Vandelay Industries',
  currency: 'usd',
  aws_region: 'us-east-2',
  stripe_pk: '$STRIPE_SECRET_KEY',
  sessionOptions: {
    secret: 'SOMESESSIONVALUE',
    cookie: {
      results: [],
      cart: new cart(null)
    },
    saveUninitialized: true,
    resave: true
  },
  success_url: 'http://localhost:8181/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'http://localhost:8181/cancel',
  paymentType: 'card'
}
