const express = require('express')

const userController = require('../controllers/userController')

const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.protect) // this will protect all the routes comming after this

router.patch('/updateMyPassword', authController.updatePassword)
router.delete('/deactivate-me', userController.deactivateMe)

router.patch('/updateMe', userController.UpdateMe)
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
)
router.use(authController.restrictTo('admin'))

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById)

module.exports = router
