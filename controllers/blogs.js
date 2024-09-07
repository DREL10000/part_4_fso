const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const obj_keys = Object.keys(request.body)
  const user = request.user
  if (!obj_keys.includes('title') || !obj_keys.includes('url')) {
    response.status(400).end() 
  }
  else {
    const blog = obj_keys.includes('likes') ? new Blog(request.body) : new Blog({ ...request.body, likes: 0 })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blog = await Blog.findById(request.params.id).populate('user')

  if (blog.user.id === decodedToken.id) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  else {
    return response.status(401).json({ error: 'not authorized to delete this blog' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blog = await Blog.findById(request.params.id).populate('user')
  if(blog.user.id === decodedToken.id)
  {
    await Blog.findByIdAndUpdate(request.params.id, { title, author, url, likes }, { new: true, runValidators: true, context: 'query' })
    response.json(200)
  }
  else {
    return response.status(401).json({ error: 'not authorized to update this blog' })
  }

})

module.exports = blogsRouter

