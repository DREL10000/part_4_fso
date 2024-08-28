const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('there are two notes', async () => {
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
    await api
    .post('/api/blogs')
    .send(newblog)
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
    await api
    .post('/api/blogs')
    .send(newblog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(blogs.find(b => b.title ==="This is the test blog" && b.likes === 0))
})

test('blog without title or url is not added', async () => {
    const newBlog = {
        author: "Andrel Daga",
        url: "https://reactpatterns.com/",
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('deleted a specified blog post', async () => {
    await api
    .delete('/api/blogs/5a422aa71b54a676234d17f8')
    .expect(204)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length - 1)
})

after(async () => {
    await mongoose.connection.close()
})