require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

//Morgan custom body token
morgan.token('body', (req, res) => JSON.stringify(req.body))

//Generate middleware
app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :response-time ms - :body'))

const errorHandler = (err, req, res, next) => {
    console.log(err.message)
    if (err.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    }
    next(err)
}

app.use(errorHandler)

//Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Phonebook</h1>')
})

app.get('/info', (req, res) => {
    res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${Date()}</p>
    `)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(err => {
        next(err)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(err => {
        next(err)
    })
})

app.post('/api/persons/', (req, res) => {
    const body = req.body

    //Check for missing data in request

    if (!body.name) {
        return res.status(400).json({
            error: 'name is missing'
        })
    }

    if (!body.number) {
        return res.status(400).json({
            error: 'number is missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})