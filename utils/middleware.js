const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
        return response.status(400).json({error: 'expected `username` to be uniques' })
    } else if (error.message.includes('Illegal arguments')){
        return response.status(400).json({error: 'ensure that you entered username and password' })
    }
    next(error)
}

module.exports = {
    errorHandler
}