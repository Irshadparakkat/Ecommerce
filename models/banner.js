const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    title: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
      required : true,
    },
    description: {
      type: String,
    },
  });

  const banner = mongoose.model('banner',bannerSchema)
  module.exports = banner