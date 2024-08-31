const express = require('express')
const morgan = require('morgan')

const app = express()
// Tw
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
//  1) MIDDLEWARE

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} // Use for logging mechanism in our terminal

app.use(express.static(`${__dirname}/public/`)) // Using a static middleware which will serve the files to the browser e.g. html files etc

//  3) ROUTES
// Mounting our routes using app.use attaching with our middleware  tourRouter & userRouter
app.use('/api/v1/tours', tourRouter) // specifying middleware with tourRouter
app.use('/api/v1/users', userRouter) // specifying middleware with userRouter

// app.use((request, response, next) => {
//   console.log('...Our Third Middleware()...')

//   next()
// })
module.exports = app
