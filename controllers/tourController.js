/* eslint-disable node/no-unsupported-features/es-syntax */
const fs = require('fs')
const Tour = require('../models/tourModel')

exports.getAllTours = async (request, response) => {
  console.log(request.query)

  try {
    // BUILDING QUERY
    const queryObj = { ...request.query } // creating new object
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((element) => delete queryObj[element])

    const query = Tour.find(queryObj)

    // const query = await Tour.find({
    //   duration : 5,
    //   dificulty: 'easy'
    // })

    // Quering using Mongoose ODM methods
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy')

    const tours = await query

    response.status(200).json({
      status: 'success',
      results: tours,
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

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// )

// exports.checkID = (request, response, next, value) => {
//   if (request.params.id * 1 > tours.length) {
//     return response.status(404).json({
//       status: 'failed',
//       message: 'Invalid Id',
//     })
//   }

//   next()
// }

// exports.checkNewUserFirst = (request, response, next) => {
//   if (!request.body.name || !request.body.price) {
//     return response.status(400).json({
//       status: 'Failed',
//       message: 'Missing attributes',
//     })
//   }
//   next()
// }

// exports.getAllTours = (request, response) => {
//   response.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours: tours,
//     },
//   })
// }

// exports.getTourById = (request, response) => {
//   const id = request.params.id * 1
//   const tour = tours.find((element) => element.id === id)

//   response.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   })
// }

// exports.addNewTour = (request, response) => {
//   const newId = tours[tours.length - 1].id + 1
//   const newTour = { id: newId, ...request.body }

//   tours.push(newTour)

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (error) => {
//       response.status(201).json({
//         status: 'Success',
//         data: {
//           tour: newTour,
//         },
//       })
//     },
//   )
// }

// exports.updateTourById = (request, response) => {
//   const id = request.params.id * 1

//   const tour = tours.find((element) => element.id === id)
//   // ____REPLACE THE CHANGES IN JSON HERE_____
//   response.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<< UPDATED TOUR >>',
//     },
//   })
// }
// exports.deleteTourById = (request, response) => {
//   const id = request.params.id * 1

//   const tour = tours.find((element) => element.id === id)
//   // _____DELETE THE OBJECT FROM JSON FILE_____
//   response.status(204).json({
//     status: 'success',
//     data: null,
//   })
// }
