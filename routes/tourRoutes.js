const express = require('express')

const tourController = require('../controllers/tourController')

const router = express.Router()
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const reviewRouter = require('../routes/reviewRoutes')

// Creating a parameteric middleware which runs only against some parameters
// router.param('id', tourController.checkID)
// router.param('id', (request, response, next, value) => {
//   // This middleware will not run for any other Route
//   console.log(`Tour id is ${value}`)
//   // WE CAN USE THIS TYPE OF MIDDLEWARE TO CHECK THE ID VALIDATION
//   next()
// })

router.use('/:tourId/reviews', reviewRouter)

router.route('/tour-statistics').get(tourController.getTourStatistics)

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  )

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.addNewTour,
  )

// to get the tours within a specific distance
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)
//    /tours-distance?distance=234&center=-40,34&unit=mi // THIS WAS THE SEND WAY TO MAKE THE URL
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances)
router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById,
  )

module.exports = router
