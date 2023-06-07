require('dotenv').config() //ympäristömuuttujat
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person') // mongoDB model


// middleware: tarkista, löytyykö 'build' kansiosta vastaava tiedosto
app.use(express.static('build'))
// middleware: tarvitaan JSON datan käsittelyyn
app.use(express.json())
// middleware: Cross-origin resource sharing
app.use(cors())

// middleware: olemattomien osoitteiden käsittely
// HUOM: otetaan käyttöön vasta koodin lopussa, muuten sotkee virheilmoituksia
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// uusi token (morgan):
morgan.token('body', function getBody (req) {
  return (JSON.stringify(req.body))
})
// middleware: käytetään seuraavaa formaattia morganin tuottamissa lokeissa
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// virheidenkäsittelijä
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  // siirry Expressin virheidenhallintaan:
  next(error)
}

// palauta kaikki resurssit:
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// info:
app.get('/info', (req, res) => {
  let currentDate= new Date()
  let noPeople = 0

  Person.find({}).then(result => {
    result.forEach(() => noPeople++)
    res.send(`<p>Phonebook has info for ${noPeople} people</p>
        <p>${currentDate}</p>`)
  })
})

// palauta resurssi id:n perusteella:
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    // käsittely siirtyy  virheidenkäsittelymiddlewarelle:
    .catch(error => next(error))
})

// poista resurssi:
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// uuden resurssin lisäys:
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // tarkista että sekä nimi että numero on annettu
  /*
    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'name or number is missing'
      })
    } */
  // luo objekti ja talleta se tietokantaan
  const personDB = new Person({
    name: body.name,
    number: body.number,
  })
  personDB.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

// numeron vaihtaminen:
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
// virheidenkäsittelijä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen
app.use(errorHandler)

// const PORT = process.env.PORT
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})