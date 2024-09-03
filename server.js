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
  console.log(connection.connections)
  console.log('DB connection successful')
})
// .catch((error) => next(error))

const port = process.env.PORT
const server = app.listen(port, () => {
  console.log('App running')
})

// Handling unhandled rejections, WHICH ARE INTERNAL SYSTEM ERRORS LIKE DB FAILURE etc.

// Each time there is any unhandled rejection somewhere in our application,
// then process object always emits an object called UNHANDLED REJECTION
// so we can subscribe to that event
process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message)
  console.log('UNHANDLED REJECTION! Shutting down...')

  // closing the server with manners
  server.close(() => {
    process.exit(1) // 1 means exception
  })
  // usually in a production app on a web server
  // we will usually have some tool in place that
  // restarts the applications right after it crashes
  // some of the platforms that use node js, actually
  // automatcally restarts the applications on their on
})

// uncalled exception, bugs that occur in our synchronous called
// and never handled anywhere
