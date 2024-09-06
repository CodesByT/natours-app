const User = require('../models/userModel')
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find()

  response.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  })
})

exports.UpdateMe = catchAsync(async (request, response, next) => {
  //  1) Create error if user POSTs password data
  if (request.body.password || request.body.confimPassword) {
    return next(new AppError('This route is not for password updates', 400))
  }
  //  2) Update user document
  // ...
  response.status(200).json({
    status: 'success',
  })
})

exports.getUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
exports.createNewUsers = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
exports.deactivateMe = catchAsync(async (request, response) => {})
