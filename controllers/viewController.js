const AppError = require('../utils/app-error')
const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catch-async')
const User = require('../models/userModel')

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find()

  response.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  })
})
exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404))
  }

  response.status(200).render('tour', {
    title: tour.name,
    tour: tour,
  })
})
exports.getLogin = catchAsync(async (request, response, next) => {
  response.status(200).render('login', {
    title: 'Log-in',
  })
})
exports.getAccount = (request, response) => {
  response.status(200).render('account', {
    title: 'Your Account',
  })
}
exports.updateUserData = catchAsync(async (request, response, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    {
      name: request.body.name,
      email: request.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  )

  response.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  })
})
