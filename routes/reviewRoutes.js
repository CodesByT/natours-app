const express = require('express')

const reviewController = require('../controllers/reviewController')

const router = express.Router()
const authController = require('../controllers/authController')

router
  .route('/')
  .get(authController.protect, reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.addReview,
  )

router.route('/:id').get(authController.protect, reviewController.getReview)

module.exports = router
