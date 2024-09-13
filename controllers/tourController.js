const Tour = require('../models/tourModel')

const APIFeatures = require('../utils/api-features')

const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')

const factory = require('./handlerFactory')

exports.aliasTopFiveTours = (request, response, next) => {
  request.query.limit = '5'
  request.query.sort = '-ratingsAverage, price'
  request.query.feilds =
    'names, description, ratingsAverage, price, summary, difficulty'

  next()
}

exports.getAllTours = factory.getAll(Tour)

exports.getTourById = factory.getOne(Tour, { path: 'reviews' })

exports.addNewTour = factory.createOne(Tour)

exports.updateTourById = factory.updateOne(Tour)

exports.deleteTourById = factory.deleteOne(Tour)

exports.getTourStatistics = catchAsync(async (request, response, next) => {
  // CREATING AGGREGATION PIPELINE IN MONGO
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$difficulty',
        // _id: '$ratingAverage',
        _id: { $toUpper: '$difficulty' },

        numberOfTours: { $sum: 1 }, // for each of the documents it will go through it will add one to this sum
        totalNumberOfRating: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 } /* 1 for ascending*/,
    },
  ])
  if (!stats) {
    return next(new AppError('No Tour found', 404))
  }
  response.status(200).json({
    status: 'success',
    data: {
      tour: stats,
    },
  })
})

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // helps to unwind the multiple values against an attribute
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTours_a_month: { $sum: 1 }, // Adding one aginst each entry
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        // we are doing this just to exclude the id field
        _id: 0,
      },
    },
    {
      $sort: {
        numberOfTours_a_month: -1, // using -1 for descending
      },
    },
    {
      $limit: 12, // only six outputs
    },
  ])
  if (!plan) {
    return next(new AppError('No Tour found', 404))
  }
  response.status(200).json({
    status: 'success',
    data: {
      tour: plan,
    },
  })
})

//  /tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (request, response, next) => {
  const { distance, latlng, unit } = request.params

  const [lat, lng] = latlng.split(',')
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  if (!lat || !lng) {
    return next(new AppError('no co-ordinates found !', 400))
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  })

  response.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  })
})

//    /distance/:latlng/unit/:unit
exports.getDistances = catchAsync(async (request, response, next) => {
  const { latlng, unit } = request.params

  const [lat, lng] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if (!lat || !lng) {
    return next(new AppError('no co-ordinates found !', 400))
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMulitplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])

  response.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  })
})
