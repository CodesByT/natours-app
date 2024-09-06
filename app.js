const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const app = express()

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/app-error')
const globalErrorHandler = require('./controllers/errorController')

// GLOBAL MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Setting SECUIRTY HTTP HEADERS
app.use(helmet())

const limiter = rateLimit({
  // 100 max request from one IP in one Hour
  // HELPS against denial of service attacks and brute force attacks
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests!! Try again later',
})
app.use('/api', limiter)

// body parser
app.use(express.json({ limit: '10kb' }))

// Data Sanatization against noSql query injection
app.use(mongoSanitize())

// Data Sanatization against cross site scripting attacks (XSS Attacks )
app.use(xss())

// prevent Prameter pollution, all it does is to remove the duplication in the api parameters
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
)

// serving static files
app.use(express.static(`${__dirname}/dev-data/templates/`)) // Using a static middleware which will serve the files to the browser e.g. html files etc

// Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (request, response, next) => {
  next(new AppError(`can't find ${request.originalUrl} on the server`, 404))
  // node will automatically consider the argument in a next function as an error
})

// DEFINING ERROR HANDLING MIDDLEWARE, with these four parameters express identifies them
app.use(globalErrorHandler)

module.exports = app
