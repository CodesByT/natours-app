const User = require('../models/userModel')
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')
const factory = require('./handlerFactory')

const filterObj = (object, ...allowedFields) => {
  const newObject = {}
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element]
  })
  return newObject
}

exports.UpdateMe = catchAsync(async (request, response, next) => {
  //  1) Create error if user POSTs password data
  if (request.body.password || request.body.confimPassword) {
    return next(new AppError('This route is not for password updates', 400))
  }
  //  2) Update user document
  const filteredBody = filterObj(request.body, 'name', 'email')
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id, // THIS USER IS COMMING FROM PROTECT FUNCTION... REMEMBER?!!
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  )

  //
  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})
exports.getMe = (request, response, next) => {
  request.params.id = request.user.id
  next()
}

exports.createNewUsers = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! user sign up instead',
  })
}

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}

// we will never update the password with this update method
exports.updateUserById = factory.updateOne(User)
exports.deleteUserById = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)

exports.deactivateMe = catchAsync(async (request, response) => {
  await User.findByIdAndUpdate(request.user.id, { active: false })

  response.status(204).json({
    status: 'success',
    data: 'null',
  })
})
