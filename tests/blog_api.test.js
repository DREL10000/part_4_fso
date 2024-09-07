const bcrypt = require('bcryptjs')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)


const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'shaw', passwordHash })
    const saved = await user.save()

    const blogObject = new Blog({ ...initialBlogs[0], user })
    await blogObject.save()

})


test('there is one note', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})


test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const obj_keys = Object.keys(response.body[0])
    assert(obj_keys.includes('id'))
})


test('the unique identifier property of the blog posts is not named _id', async () => {
    const response = await api.get('/api/blogs')
    const obj_keys = Object.keys(response.body[0])
    assert(obj_keys.includes('id'), false)
})

test('successfully creates a new blog post', async () => {
    const newblog = {
        title: "This is the test blog",
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
        likes: 50000,
    }
    //log user in
   const tok_obj = await api
    .post('/api/login/')
    .send({ username: 'shaw', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const token = 'Bearer ' + tok_obj.body.token

    await api
        .post('/api/blogs')
        .send(newblog)
        .set({ Authorization: token})
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map((r) => r.title)

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(titles.includes('This is the test blog'))
})

test('missing likes property defaults to 0', async () => {
    const newblog = {
        title: "This is the test blog",
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
    }

     //log user in
    const tok_obj = await api
     .post('/api/login/')
     .send({ username: 'shaw', password: 'sekret' })
     .expect(200)
     .expect('Content-Type', /application\/json/)
 
     const token = 'Bearer ' + tok_obj.body.token
 
    await api
        .post('/api/blogs')
        .send(newblog)
        .set({ Authorization: token})
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(blogs.find(b => b.title === "This is the test blog" && b.likes === 0))
})


test('blog without title or url is not added', async () => {
    const newBlog = {
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
    }

      //log user in
      const tok_obj = await api
      .post('/api/login/')
      .send({ username: 'shaw', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
      const token = 'Bearer ' + tok_obj.body.token

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token})
        .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('deleted a specified blog post', async () => {

     //log user in
     const tok_obj = await api
     .post('/api/login/')
     .send({ username: 'shaw', password: 'sekret' })
     .expect(200)
     .expect('Content-Type', /application\/json/)
 
     const token = 'Bearer ' + tok_obj.body.token

     const blogs = await api.get('/api/blogs/')
     const endpoint = '/api/blogs/' + blogs.body[0].id

    await api
        .delete(endpoint)
        .set({ Authorization: token})
        .expect(204)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length - 1)
})

test('updated the property of a specified blog post', async () => {
    const updatedBlog = {
        title: 'To test the put endpoint',
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
    }

     //log user in
     tok_obj = await api
     .post('/api/login/')
     .send({ username: 'shaw', password: 'sekret' })
     .expect(200)
     .expect('Content-Type', /application\/json/)
 
     const token = 'Bearer ' + tok_obj.body.token

     const blogs = await api.get('/api/blogs/')
     const endpoint = '/api/blogs/' + blogs.body[0].id

    await api
        .put(endpoint)
        .set({ Authorization: token})
        .send(updatedBlog)
        .expect(200)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)
    assert(titles.includes(updatedBlog.title))
})

test('fails with status code 401 if token is not provided', async () => {
    const newblog = {
        title: "This is the test blog",
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
        likes: 50000,
    }

    await api
        .post('/api/blogs')
        .send(newblog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
})

after(async () => {
    await mongoose.connection.close()
})

