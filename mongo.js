const mongoose = require('mongoose')

// argumenttien lkm
const noArgs= process.argv.length

if (noArgs<3) {
    console.log('give password as argument')
    process.exit(1)
  }

// annettu salasana
const password = process.argv[2]

const url =
  `mongodb+srv://tatumhanttila:${password}@cluster0.jz24lbz.mongodb.net/phoneApp?retryWrites=true&w=majority`
  
mongoose.set('strictQuery', false)
mongoose.connect(url)

//schema
const personSchema = new mongoose.Schema({
    name: String,
    number: String,    
  })
// model
const Person = mongoose.model('Person', personSchema)

// lisää objekti tietokantaan:
if (noArgs === 5) {
    const newName= process.argv[3]
    const newNumber= process.argv[4]

    const person = new Person({
        name: newName,
        number: newNumber,
      })
      
    person.save().then(result => {
        console.log(`added ${newName} number ${newNumber} to phonebook`)
        mongoose.connection.close()
      })
}

// tulosta kokoelman tiedot:
if (noArgs === 3) {
    console.log("Phonebook:")
    Person.find({}).then(result => {
        result.forEach(person=> {
        console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}


