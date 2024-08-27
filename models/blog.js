const config = require('../utils/config')
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })
  
  
  const mongoUrl = config.MONGODB_URI;
  mongoose.connect(mongoUrl)
  .then((res)=> console.log('connected to db successfully'))
  .catch((e) => console.log('error connecting to db'))

module.exports = mongoose.model('Blog', blogSchema)