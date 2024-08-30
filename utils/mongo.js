const config = require('./config')
const mongoose = require('mongoose')

const mongoUrl = config.MONGODB_URI;
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(mongoUrl)
        console.log('connected to db')
    }
    catch(e){
        console.log('error connecting to db')
    }
}

module.exports = connectDB

