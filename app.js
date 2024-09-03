const express = require('express')
const morgan = require('morgan')

const app = express()

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/app-error')
const globalErrorHandler = require('./controllers/errorController')

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.static(`${__dirname}/public/`)) // Using a static middleware which will serve the files to the browser e.g. html files etc

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (request, response, next) => {
  // const error = new Error(`can't find ${request.originalUrl} on the server`)
  // error.status = 'fail'
  // error.statusCode = 404

  next(new AppError(`can't find ${request.originalUrl} on the server`, 404))
  // node will automatically consider the argument in a next function as an error
})

// DEFINING ERROR HANDLING MIDDLEWARE, with these four parameters express identifies them
app.use(globalErrorHandler)

module.exports = app
