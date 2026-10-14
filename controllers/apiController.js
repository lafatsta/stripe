/* Controller to manage all endpoints of stripe-ecommerce-app based on user interaction and Stripe API integrations*/

var catalogs = require('../models/catalogModel')
var cart = require('../models/cartModel')
var constants = require('../constants')
const url = require('url')
var debug = require('debug')('app')
var stripe = ''

/* Import rate limiting middleware */
const rateLimit = require('express-rate-limit')

/* Create a rate limiter: max 100 requests per 15 minutes from a single IP */
const addToCartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: 'Too many requests, please try again later.'
})

/* Create a rate limiter for shop browsing */
const shopLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: 'Too many requests on shop, please try again later.'
})

/* Using AWS Secrets Manager to secure stripe_sk instead of exposed in code/configurations*/
var awssecrets = require('../aws/aws-secrets')
const express = require('express')
awssecrets.handler().then(function (data) {
  stripe = require('stripe')(data.secrets.stripe_sk)
})

module.exports = function (app) {
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.get(['/shop', '/'], shopLimiter, async function (req, res, next) {
    try {
      const currentCart = new cart(req.session.cart)
      const results = await catalogs.find({}).lean()
      req.session.results = results
      res.render('shop', {
        title: constants.title,
        results: results,
        cartItem: currentCart
      })
    } catch (err) {
      next(err)
    }
  })
  /*
      catalogs.find({}, function (err, results) {
      if (err) throw err
      req.session.results = results
      res.render('shop', {
        title: constants.title,
        results: results,
        cartItem: currentCart
      })
    })
      */

  app.get(
    '/addToCart/:productID',
    addToCartLimiter,
    async function (req, res, next) {
      try {
        const cartItem = new cart(req.session.cart)

        const results = await catalogs.find({}).lean()

        const item = results.find(
          item => item.product_id == req.params.productID
        )

        if (!item) {
          return res.status(404).send('Product not found')
        }

        cartItem.add(req.params.productID, item)

        req.session.cart = cartItem
        req.session.results = results

        res.redirect('/shop')
      } catch (err) {
        next(err)
      }
    }
  )

  app.get('/Checkout', async function (req, res, next) {
    try {
      const cartState = new cart(req.session.cart)
      req.session.cart = cartState

      const itemsInShoppingCart = cartState.items || {}
      const keys = Object.keys(itemsInShoppingCart)

      const lineItems = []

      for (let i = 0; i < keys.length; i++) {
        const itemInList = itemsInShoppingCart[keys[i]]

        lineItems.push({
          quantity: itemInList.quantity,
          price_data: {
            currency: constants.currency,
            unit_amount: Math.round(
              (itemInList.totalCost / itemInList.quantity) * 100
            ),
            product_data: {
              name: itemInList.item.item,
              description: itemInList.item.description,
              images: [itemInList.item.img]
            }
          }
        })
      }

      if (lineItems.length === 0) {
        return res.render('checkout', {
          title: constants.title,
          items: [],
          checkoutError: 'Your cart is empty!'
        })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: [constants.paymentType],
        success_url: constants.success_url,
        cancel_url: constants.cancel_url,
        line_items: lineItems
      })

      res.render('checkout', {
        title: constants.title,
        items: lineItems,
        sessionID: session.id,
        pk: constants.stripe_pk
      })
    } catch (err) {
      next(err)
    }
  })

  app.get('/success', async (req, res) => {
    try {
      const info = url.parse(req.url, true).query

      // Expand line_items to get the array
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        info.session_id,
        { expand: ['line_items.data.price'] }
      )

      let amount = 0

      // Modern Stripe: use line_items.data
      checkoutSession.line_items.data.forEach(item => {
        amount += item.price.unit_amount * item.quantity
      })
      /*
           Charge ID not found in checkout Session object, Looked through Payment Intent Object, yet charges also empty. Perhaps due to using a test CC, there is no charge?
        */

      /* Checkout Session amount only accepts integers and forces decimals based on input. Fixing two decimals before and after API calls*/
      res.render('success', {
        title: constants.title,
        checkoutSession: checkoutSession,
        amount: amount / 100,
        msg: 'Congratulations!'
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error retrieving session')
    }
  })

  app.get('/cancel', function (req, res) {
    res.render('error', {
      msg: 'Unable to complete payment. Please Try Again!'
    })
  })
}

function newFunction (itemInList) {
  debug(itemInList)
}
