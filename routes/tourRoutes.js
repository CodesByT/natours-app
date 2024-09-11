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

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router.route('/tour-statistics').get(tourController.getTourStatistics)

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.addNewTour) // Chaining two middlewares

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById,
  )

router.use('/:tourId/reviews', reviewRouter)

module.exports = router
