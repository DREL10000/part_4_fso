const config = require('../utils/config')
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
  
  
  const mongoUrl = config.MONGODB_URI;
  mongoose.connect(mongoUrl)
  .then((res)=> console.log('connected to db successfully'))
  .catch((e) => console.log('error connecting to db'))

module.exports = mongoose.model('Blog', blogSchema)