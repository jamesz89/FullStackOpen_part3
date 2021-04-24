const express = require('express')
const app = express()
const PORT = 3001

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-34-234345'
    },
    {
        id: 4,
        name: 'May Poppendick',
        number: '39-23-6423122'
    }
]

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
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(person => person.id === Number(id))
    person ? res.json(person) : res.status(404).send(`Resource doesn't exist`)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})