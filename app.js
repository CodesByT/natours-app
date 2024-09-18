const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const app = express()
const path = require('path')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/app-error')
const globalErrorHandler = require('./controllers/errorController')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))) // Using a static middleware which will serve the files to the browser e.g. html files etc

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Setting SECUIRTY HTTP HEADERS
app.use(helmet())

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
      ],
    },
  }),
)

const limiter = rateLimit({
  // 100 max request from one IP in one Hour
  // HELPS against denial of service attacks and brute force attacks
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests!! Try again later',
})
app.use('/api', limiter)

// body parser
app.use(express.json({ limit: '10kb' })) // it parses the data from the body
app.use(cookieParser()) // it parses the cookie

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

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString()
  console.log(request.cookies)
  next()
})

// Routes
app.use('/', viewRouter)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/review', reviewRouter)

app.all('*', (request, response, next) => {
  next(new AppError(`can't find ${request.originalUrl} on the server`, 404))
  // node will automatically consider the argument in a next function as an error
})

// DEFINING ERROR HANDLING MIDDLEWARE, with these four parameters express identifies them
app.use(globalErrorHandler)

module.exports = app
