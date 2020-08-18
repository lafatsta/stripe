/* Controller to manage all endpoints of stripe-ecommerce-app based on user interaction and Stripe API integrations*/

var catalogs = require('../models/catalogModel');
var bodyParser = require('body-parser');
var cart = require('../models/cartModel');
var constants = require('../constants');
const url = require('url');
var debug = require('debug')('app')
var stripe = "";

/* Using AWS Secrets Manager to secure stripe_sk instead of exposed in code/configurations*/
var awssecrets = require('../aws/aws-secrets');
awssecrets.handler().then(function (data) {
    stripe = require('stripe')(data.secrets.stripe_sk);
});


module.exports = function (app) {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get(['/shop', '/'], function (req, res) {
        var currentCart = new cart(req.session.cart);
        catalogs.find({},
            function (err, results) {
                if (err) throw err;
                req.session.results = results;
                res.render('shop', { title: constants.title, results: results, cartItem: currentCart });
            });

    });

    app.get('/addToCart/:productID', function (req, res) {
        var cartItem = new cart(req.session.cart);
        catalogs.find({},
            function (err, results) {
                if (err) throw err;
                var item = results.filter(function (item) {
                    return item.product_id == req.params.productID;
                });
                cartItem.add(req.params.productID, item[0]);
                req.session.cart = cartItem;
                req.session.results = results;
                res.redirect('/shop');
            });
    });

    app.get('/Checkout', function (req, res) {
        var cartState = new cart(req.session.cart);
        req.session.cart = cartState;

        var itemsInShoppingCart = cartState.items;
        var keys = Object.keys(itemsInShoppingCart);
        var lineItems = [];
        /*
          Iterating through the cart to populate the lineItems requirement for Checkout Session creation. 
          Amount had to be padding with two zeros since amount only allows integers, and decimals are shifted two to the lefft
         */
        for (var i = 0, length = keys.length; i < length; i++) {
            var itemInList = itemsInShoppingCart[keys[i]];
            var lineItem = { name: itemInList.item.item, description: itemInList.item.description, images: [itemInList.item.img], amount: (itemInList.totalCost / itemInList.quantity) * 100, currency: constants.currency, quantity: itemInList.quantity };
            lineItems.push(lineItem);
        }
        if (lineItems.length > 0) {
            stripe.checkout.sessions.create(
                {
                    success_url: constants.success_url,
                    cancel_url: constants.cancel_url,
                    payment_method_types: [constants.paymentType],
                    line_items: lineItems,
                },
                function (err, session) {
                    if (err) throw err;
                    res.render('checkout', { title: constants.title, items: lineItems, sessionID: session.id, pk: constants.stripe_pk });
                });
        } else {
            res.render('checkout', { title: constants.title, items: lineItems, checkoutError: "Your cart is empty!" });
        }
    });

    app.get('/success', async (req, res) => {
        var info = url.parse(req.url, true).query;
        var checkoutSession = await stripe.checkout.sessions.retrieve(info.session_id);
        var amount = 0;
        checkoutSession.display_items.forEach(element => {
            amount += (element.amount * element.quantity);
        });
        /*
           Charge ID not found in checkout Session object, Looked through Payment Intent Object, yet charges also empty. Perhaps due to using a test CC, there is no charge?
        */

        /* Checkout Session amount only accepts integers and forces decimals based on input. Fixing two decimals before and after API calls*/
        res.render('success', { title: constants.title, checkoutSession: checkoutSession, amount: amount / 100, msg: "Congratulations!" });
    });

    app.get('/cancel', function (req, res) {
        res.render('error', { msg: "Unable to complete payment. Please Try Again!" });
    });

}

function newFunction(itemInList) {
    debug(itemInList);
}

