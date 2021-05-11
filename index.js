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
    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }else if (err.name === 'ValidationError') {
        return res.status(400).send({ error: 'name must be unique' })
    }
    next(err)
}

app.use(errorHandler)

//Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Phonebook</h1>')
})

app.get('/info', (req, res) => {
    Person.estimatedDocumentCount({}, (err, count) => {
        res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${Date()}</p>
        `)
    })
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

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(err => next(err))
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

app.post('/api/persons/', (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
        .catch(err => next(err))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})