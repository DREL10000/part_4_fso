const bcrypt = require('bcryptjs')
const User = require('../models/user')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const initialUsers = await api.get('/api/users')


        const newUser = {
            username: 'canzo',
            name: 'Andrel Canzo',
            password: 'andy@123',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const afterMath = await api.get('/api/users')
        assert.strictEqual(afterMath.body.length, initialUsers.body.length + 1)

        const usernames = afterMath.body.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })
})

describe('when we attempt to add an invalid user to the db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation fails with an invalid username', async () => {
        const initialUsers = await api.get('/api/users')


        const newUser = {
            username: 'cz',
            name: 'Andrel Canzo',
            password: 'andy@123',
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const afterMath = await api.get('/api/users')
        assert.strictEqual(afterMath.body.length, initialUsers.body.length)
        assert.strictEqual(response.body.error,'User validation failed: username: Path `username` (`cz`) is shorter than the minimum allowed length (3).')
    })

})

after(async () => {
    await mongoose.connection.close()
})