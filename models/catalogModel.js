var mongoose = require('mongoose')

var Schema = mongoose.Schema

var catalogSchema = new Schema({
  product_id: {
    type: Number,
    unique: true,
    required: true
  },
  item: String,
  description: String,
  img: String,
  price: Number
})

var catalogs = mongoose.model('Catalogs', catalogSchema)

module.exports = catalogs
