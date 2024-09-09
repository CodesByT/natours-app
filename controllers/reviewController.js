const Review = require('../models/reviewModel')

const APIFeatures = require('../utils/api-features')

const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')

exports.addReview = catchAsync(async (request, response, next) => {
  const review = await Review.create(request.body)

  response.status(200).json({
    status: 'success',
    message: review,
  })
})

exports.getReview = catchAsync(async (request, response, next) => {
  const review = await Review.findById(request.params.id)

  if (!review) {
    return next(new AppError('No review Found!', 404))
  }
  response.status(200).json({
    status: 'success',
    message: review,
  })
})
exports.getAllReview = catchAsync(async (request, response, next) => {
  console.log('here')
  const allReviews = await Review.find()

  response.status(200).json({
    status: 'success',
    message: {
      allReviews,
    },
  })
})
