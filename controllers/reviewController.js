const Review = require('../models/reviewModel')

const APIFeatures = require('../utils/api-features')

const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')

exports.addReview = catchAsync(async (request, response, next) => {
  // Allow nested routes
  if (!request.body.tour) {
    request.body.relatedTour = request.params.tourId
  }
  if (!request.body.user) {
    request.body.relatedUser = request.user.id
  }

  const review = await Review.create(request.body)

  response.status(201).json({
    status: 'success',
    data: { review: review },
  })
})

// exports.getReview = catchAsync(async (request, response, next) => {
//   const review = await Review.findById(request.params.id)

//   if (!review) {
//     return next(new AppError('No review Found!', 404))
//   }
//   response.status(200).json({
//     status: 'success',
//     message: review,
//   })
// })
exports.getAllReview = catchAsync(async (request, response, next) => {
  let filter = {}
  if (request.params.tourId) filter = { relatedTour: request.params.tourId }

  console.log(filter)
  const allReviews = await Review.find(filter)

  response.status(200).json({
    status: 'success',
    message: {
      reviews: allReviews,
    },
  })
})
