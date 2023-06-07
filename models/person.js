const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//schema
const personSchema = new mongoose.Schema({
    name: 
    {
      type: String,
      minlength: 3,
      required: true
    },
    number: 
    {      
      type: String,    
      // tarkistetaan, onko numero vaaditussa muodossa:
      validate: {
        validator: function(v) {
          let tmp= v.split("-")
          console.log(tmp)
          if (tmp.length != 2) {
            console.log(1)
            return false
          }
          else if (tmp[0].lenght<2 || tmp[0].length >3)  {
            console.log(2)
            return false
          }
          else if (tmp[1].length < (8- tmp[0].length)) {
            console.log(3)
            return false
          }
          else if (isNaN(tmp[0]) || isNaN(tmp[1])) {
            console.log(4)
            return false 
          }
          else
            return true 
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required: true
    }
  })

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)