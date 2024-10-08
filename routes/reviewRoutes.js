const express = require('express')

const reviewController = require('../controllers/reviewController')

const authController = require('../controllers/authController')

// by default the routers have access to there on route paramaters
// by we are also calling the addReview from tourController
// which has to come with a tourId so we have to merge the
// params of these we routers and has to enable the mergeParams option
const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourAndUsersIds,
    reviewController.addReview,
  )

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReviewById,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReviewById,
  )

module.exports = router
