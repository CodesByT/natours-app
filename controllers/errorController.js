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
const sendErrorProduction = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    // FOR API ERROR
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      })
    }
    return response.status(500).json({
      status: 'status',
      message: 'Something went wrong',
    })
  }
  // FOR RENDERING WEBSITE
  if (error.isOperational) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    })
  }

  return response.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  })
}
const sendErrorDevelopment = (error, request, response) => {
  //
  if (request.originalUrl.startsWith('/api')) {
    response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    })
  }
  //
  else {
    response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    })
  }
}
const handleJWTError = (error) => new AppError('Invalid Token!', 401)
const handleJWTExpiredError = (error) =>
  new AppError('Token timer expired!', 401)

module.exports = (error, request, response, next) => {
  error.statusCode = error.statuscode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, request, response)
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error }
    err.message = error.message

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

    sendErrorProduction(err, request, response)
  }
}
