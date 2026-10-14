/* Populate the MongoDB Cluster with data to be used in demostration of stripe-ecommerce-app*/

const catalogs = require('../models/catalogModel')

module.exports = function (app) {
  app.get('/api/setupItems', async function (req, res, next) {
    try {
      const startingItems = [
        {
          product_id: 1,
          item: 'TV',
          description: 'Watching TV',
          img: 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
          price: 1000
        },
        {
          product_id: 2,
          item: 'Laptop',
          description: 'Using Laptop in front of TV',
          img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
          price: 500
        },
        {
          product_id: 3,
          item: 'Phone',
          description: 'Talk on Phone',
          img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
          price: 300
        },
        {
          product_id: 4,
          item: 'Tablet',
          description: 'Use a tablet',
          img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
          price: 200
        }
      ]
      await catalogs.deleteMany({})
      const results = catalogs.create(startingItems)
      res.json(results)
    } catch (err) {
      next(err)
    }
  })
}
