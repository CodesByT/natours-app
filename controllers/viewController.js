const AppError = require('../utils/app-error')
const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catch-async')

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find()

  response.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  })
})
exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })

  response.status(200).render('tour', {
    tour: tour,
  })
})
