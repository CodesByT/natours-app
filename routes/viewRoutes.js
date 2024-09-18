const express = require('express')

const router = express.Router()
const viewController = require('../controllers/viewController')

const authController = require('../controllers/authController')

// this will be attached to each and every request that comes in
router.use(authController.isLoggedin)

router.get('/', viewController.getOverview)
router.get('/tour/:slug', authController.protect, viewController.getTour)
router.get('/login', viewController.getLogin)

module.exports = router
