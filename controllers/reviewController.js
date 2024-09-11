const Review = require('../models/reviewModel')

const APIFeatures = require('../utils/api-features')

const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const factory = require('./handlerFactory')

exports.setTourAndUsersIds = (request, response, next) => {
  // Allow nested routes
  if (!request.body.tour) {
    request.body.relatedTour = request.params.tourId
  }
  if (!request.body.user) {
    request.body.relatedUser = request.user.id
  }
  next()
}

exports.addReview = factory.createOne(Review)
exports.getAllReview = factory.getAll(Review)
exports.getReviewById = factory.getOne(Review)
exports.updateReviewById = factory.updateOne(Review)
exports.deleteReviewById = factory.deleteOne(Review)
