/* eslint-disable node/no-unsupported-features/es-syntax */
const fs = require('fs')
const Tour = require('../models/tourModel')

const APIFeatures = require('../utils/api-features')

exports.aliasTopFiveTours = (request, response) => {
  request.query.limit = '5'
  request.query.sort = '-ratingsAverage, price'
  request.query.feilds =
    'names, description, ratingsAverage, price, summary, difficulty'

  next()
}

exports.getAllTours = async (request, response) => {
  console.log('QUERY: ', request.query) // i guess it identify the query from the question mark like tour?duration[lte]=70
  console.log('PARAMS: ', request.params)
  try {
    // AWAIT THE QUERY
    let features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limit()

    features = await features.paginate()

    const tours = await features.queryForMongo

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      results: error,
    })
  }
}

exports.getTourById = async (request, response) => {
  try {
    // const getTour = await Tour.find({ _id: request.params.id })
    const getTour = await Tour.findById(request.params.id)

    response.status(200).json({
      status: 'success',
      message: getTour,
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      message: error,
    })
  }
}

exports.addNewTour = async (request, response) => {
  // const newTour = new Tour({})
  // newTour.save()
  try {
    const newTour = await Tour.create(request.body)
    response.status(200).json({
      status: 'success',
      message: newTour,
    })
  } catch (error) {
    response.status(400).json({
      status: 'failed',
      message: error,
    })
  }
}

exports.updateTourById = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    })
    response.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      data: {},
    })
  }
}
exports.deleteTourById = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id)
    response.status(200).json({
      status: 'success',
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      data: {},
    })
  }
}
exports.getTourStatistics = async (request, response) => {
  try {
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
    response.status(200).json({
      status: 'success',
      data: {
        tour: stats,
      },
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      data: {},
    })
  }
}
exports.getMonthlyPlan = async (request, response) => {
  console.log('working1')
  try {
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
    console.log('working3')

    response.status(200).json({
      status: 'success',
      data: {
        tour: plan,
      },
    })
  } catch (error) {
    response.status(404).json({
      status: 'failed',
      data: {},
    })
  }
}
