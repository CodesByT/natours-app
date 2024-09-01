const mongoose = require('mongoose')

const dotenv = require('dotenv')

dotenv.config({ path: './config.env' }) // Setting our environment variables
//console.log(process.env) // to check the environment variable
const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

mongoose.connect(DB, {}).then((connection) => {
  //console.log(connection.connections)
  console.log('DB connection successful')
})

const port = process.env.PORT
app.listen(port, () => {
  console.log('App running')
})
