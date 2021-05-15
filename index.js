const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

//Set morgan custom body token
morgan.token('body', (req) => JSON.stringify(req.body))

//Error handling
const errorHandler = (error, req, res) => {
  console.log('Error handler caught something')
    
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(409).send({ error: error})
  }
}

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :body'))


//Routes
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Phonebook</h1>')
})

app.get('/info', (req, res) => {
  Person.estimatedDocumentCount({}, (error, count) => {
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
    .catch(error => {
      next(error)
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
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then( () => {
      res.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body
    
  const person = new Person({
    name: body.name,
    number: body.number
  })
    
  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))
})

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})