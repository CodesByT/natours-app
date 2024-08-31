const mongoose = require('mongoose')

const dotenv = require('dotenv')

dotenv.config({ path: './config.env' }) // Setting our environment variables
//console.log(process.env) // to check the environment variable
const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

mongoose
  .connect(DB, {
    // useNewUrlParser, useUnifiedTopology, useFindAndModify,
    // and useCreateIndex are no longer supported options.
    // Mongoose 6 always behaves as if useNewUrlParser,
    // useUnifiedTopology, and useCreateIndex are true,
    // and useFindAndModify is false. Please remove these
    // options from your code.
    //  useCreateIndex: true,
    //  useFindAndModify: false,
    //  useNewUrlParser: true,
    //  useUnifiedTopology: true
  })
  .then((connection) => {
    console.log(connection.connections)
    console.log('DB connection successful')
  })

const port = process.env.PORT
app.listen(port, () => {
  console.log('App running')
})
