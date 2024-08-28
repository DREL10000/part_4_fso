const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const obj_keys = Object.keys(request.body)
  if(!obj_keys.includes('title') || !obj_keys.includes('url'))
  {
    response.status(400).end()
  }
  else
  {
    const blog = obj_keys.includes('likes') ? new Blog(request.body): new Blog({...request.body, likes: 0})
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter

