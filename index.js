require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')
const app = express()

//Morgan custom body token
morgan.token('body', (req, res) => JSON.stringify(req.body))

//Generate middleware
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :response-time ms - :body'))

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
    // mongoose.connection.close()
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    person ? res.json(person) : res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

const generateId = () => Math.floor((Math.random() * 1000))

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

    //Check if name already exists
    const isDuplicated = persons.some(person => person.name === body.name)

    if (isDuplicated) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    //Add person to collection
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})