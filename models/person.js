const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URL

console.log('Connecting to Person MongoDB URL', url)

mongoose.connect(url)
    .then(result => {
        console.log('Connected Successfully')
    })
    .catch(error => {
        console.log('Error connecting to MongoDB URL:', error.message)
    })

//create database schema
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
        unique: true,
        minlength: 3,
    },
    number: {
        type: String,
        required: true,
        minlength: 8,
    },
    data: {
        type: Date
    },
})

personSchema.plugin(uniqueValidator)

//format the response id
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject._v
    }
})

module.exports = mongoose.model('Person', personSchema)