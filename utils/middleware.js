const jwt = require('jsonwebtoken')
const User = require('../models/user')

const excludedEndpoint = '/';

const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be uniques' })
    } else if (error.message.includes('Illegal arguments')) {
        return response.status(400).json({ error: 'ensure that you entered username and password' })
    } else if (request.token && request.user && error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token invalid' })
    }
    next(error)
}

const tokenExtractor = (request, response, next) => {
    if (request.method !== 'GET') {
        const authorization = request.get('authorization')
        if (authorization && authorization.startsWith('Bearer ')) {
            request.token = authorization.replace('Bearer ', '').trim();
        }
        else{
            response.status(401).json({ error: 'token was not provided'})
        }
    }
    next()
}

const userExtractor = async (request, response, next) => {
    if (request.method !== 'GET') {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (decodedToken.id) {
            const user = await User.findById(decodedToken.id)
            request.user = user
        }
    }
    next()
}

module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}