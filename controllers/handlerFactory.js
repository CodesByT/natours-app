//
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')
const APIFeatures = require('../utils/api-features')

exports.deleteOne = (Model) =>
  catchAsync(async (request, response, next) => {
    //
    const document = await Model.findByIdAndDelete(request.params.id)

    if (!document) {
      return next(new AppError('No document found', 404))
    }

    response.status(204).json({
      status: 'success',
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (request, response, next) => {
    //
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      },
    )

    if (!document) {
      return next(new AppError('No document found', 404))
    }

    response.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (request, response, next) => {
    //
    const document = await Model.create(request.body)

    response.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (request, response, next) => {
    //
    let query = Model.findById(request.params.id)
    if (populateOptions) {
      query.populate(populateOptions)
    }

    const document = await query

    if (!document) {
      return next(new AppError('No Document found', 404))
    }

    response.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })

exports.getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    //
    // to allow for nested GET reviews on tour (hack)
    let filter = {}
    if (request.params.tourId) filter = { relatedTour: request.params.tourId }

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limit()
      .paginate()

    const document = await features.queryForMongo

    response.status(200).json({
      status: 'success',
      results: document.length,
      data: { document },
    })
  })
