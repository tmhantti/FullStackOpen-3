const express = require('express')
var morgan = require('morgan')

const app = express()
const cors = require('cors')
app.use(express.json()) // tarvitaan JSON datan käsittelyyn
app.use(cors())
// tarkista, löytyykö 'build' kansiosta vastaava tiedosto:
app.use(express.static('build')) 

// uusi token (morgan): 
morgan.token('body', function getBody (req) {
    return (JSON.stringify(req.body))
  })

// käytetään seuraavaa formaattia morganin tuottamissa lokeissa
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons= [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    { 
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122",
        "id": 4
    }
  ]

// palauta kaikki
app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

// info
app.get('/info', (req, res) => {
    let dd= new Date()
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${dd}</p>`)    
  })

// palauta resurssi id:n perusteella
app.get('/api/persons/:id', (request, response) => {
    // muunna numeroksi (muuten vertailu (ks. alla) ei toimi)
    const id = Number(request.params.id) 
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else { // 404 jos resurssia ei löydy
      // end ilmoittaa siitä, että pyyntöön tulee vastata ilman dataa
      response.status(404).end()
    }
  })

// poista resurssi
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons= persons.filter(person => person.id !== id)  
    response.status(204).end()
  })

// uuden resurssin lisäys
app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log('error666')
    // tarkista että nimi ja numero on annettu
    if (!body.name || !body.number) {
      console.log('error666')
      return response.status(400).json({ 
        error: 'name or number is missing' 
      })
    }
    // tarkista, ettei numeroa ole jo luettelossa
    const number = persons.find(person => person.number === body.number)
    if (number) {
        return response.status(400).json({ 
            error: 'number already exists in the phonebook' 
          })
    }
    // luo objekti
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
    persons = persons.concat(person)  
    response.json(person)
  })

// uuden ID:n generointi
const generateId = () => {
    min= 1
    max= 10000
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

// const PORT = process.env.PORT || 3001
const PORT = 3000 // muutettu fly.io:n vaatimusten mukaisesti
app.listen(PORT)
console.log(`Server running on port ${PORT}`)