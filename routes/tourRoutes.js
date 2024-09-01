const express = require('express')

const tourController = require('../controllers/tourController')

const router = express.Router()

// Creating a parameteric middleware which runs only against some parameters
// router.param('id', tourController.checkID)
// router.param('id', (request, response, next, value) => {
//   // This middleware will not run for any other Route
//   console.log(`Tour id is ${value}`)
//   // WE CAN USE THIS TYPE OF MIDDLEWARE TO CHECK THE ID VALIDATION
//   next()
// })

router.route('/tour-statistics').get(tourController.getTourStatistics)

router
  .route('/top-5-cheap-tours')
  .get(tourController.aliasTopFiveTours, tourController.getAllTours)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.addNewTour) // Chaining two middlewares

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(tourController.deleteTourById)

module.exports = router
