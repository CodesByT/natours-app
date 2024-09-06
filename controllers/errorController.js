//

const AppError = require('../utils/app-error')

//
// For invalid id
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`
  return new AppError(message, 400)
}

// for duplicate entry
const handleDuplicateFeildErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Account already exist: ${value}`
  return new AppError(message, 400)
}

// for invalid value updation against an id
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((element) => element.message)

  const message = `Invalid Entry in a feild.${errors.join('. ')}`
  return new AppError(message, 400)
}
const sendErrorProduction = (error, response) => {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    })
  } else {
    response.status(500).json({
      status: 'status',
      message: 'Something went wrong',
    })
  }
}
const sendErrorDevelopment = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  })
}
const handleJWTError = (error) => new AppError('Invalid Token!', 401)
const handleJWTExpiredError = (error) =>
  new AppError('Token timer expired!', 401)

module.exports = (error, request, response, next) => {
  error.statusCode = error.statuscode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, response)
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error }

    if (err.name === 'CastError') {
      err = handleCastErrorDB(err)
    }
    if (err.code === 11000) {
      err = handleDuplicateFeildErrorDB(err)
    }
    if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err)
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleJWTError(err)
    }
    if (err.name === 'TokenExpiredError') {
      err = handleJWTExpiredError(err)
    }

    sendErrorProduction(err, response)
  }
}
