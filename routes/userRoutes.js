const express = require('express')

const userController = require('../controllers/userController')

const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
)
router.delete(
  '/deactivate-me',
  authController.protect,
  userController.deactivateMe,
)

router.patch('/updateMe', authController.protect, userController.UpdateMe)

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUserById)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUserById,
  )

module.exports = router
