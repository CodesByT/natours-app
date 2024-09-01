const express = require('express')
const morgan = require('morgan')

const app = express()

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.static(`${__dirname}/public/`)) // Using a static middleware which will serve the files to the browser e.g. html files etc

app.use('/api/v1/tours', tourRouter) 
app.use('/api/v1/users', userRouter) 

module.exports = app
