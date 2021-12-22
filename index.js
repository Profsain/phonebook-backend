const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.static('build'))

//request logger middleware
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('------')
    next()
}
app.use(requestLogger)

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello Welcome!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const totalObj = persons.length
    const date = new Date()
    response.send(`Phonebook has total number of ${totalObj} people. 
     Date: ${date}`)
})

//fetching single phonebook entry
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

//Delete single phone entry mongoDB method
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

//Posting to backend server
app.use(express.json())

app.post('/api/persons', (request, response) => {
    const person = request.body
    const checkPerson = persons.filter(p => p.name === person.name)
   
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'Missing Name or Phone number'
        })
    } else if (checkPerson.length > 0) {
        return response.status(400).json({
            error: "name must be unique"
        })
    } else {
        const personObj = new Person({
            name: person.name,
            number: person.number,
            date: new Date(),
        })
        personObj.save().then(savePerson => {
            response.json(savePerson)
        })
    }

    
})

//Handle request error
morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join('')
})

//MongoDB database error handler
const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'Malfunction id' })
    }
    next(error)
} 
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})