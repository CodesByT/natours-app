//
const { json } = require('express')

const jwt = require('jsonwebtoken')

const { promisify } = require('util')

const User = require('../models/userModel')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

const assignToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

exports.signup = catchAsync(async (request, response, next) => {
  const user = await User.create(request.body)

  const token = assignToken(user._id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100,
    ),
    httpOnly: true, // cookie cannot be accessed by the browser in any way
    // the onlything browser can do is to receive the cookie store it
    // and sent it along with the requests
  }

  if (process.env.NODE_ENV == 'production') cookieOptions.secure = true // cookie will only sent on an HTTPS secure route

  response.cookie('jwt', token, cookieOptions)

  // Remove the password from outputing in json response
  user.password = undefined

  response.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  })
})

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body

  //1) check if email and password exist?
  if (!email || !password) {
    next(new AppError('Please provide email and password!', 404))
  }
  //2) check if user exist and password correct
  const user = await User.findOne({ email }).select('+password') // since we have de-selected the password field from the schema, that is why we have to add this .select()

  if (!user) next(new AppError('Incorrect email or password!', 401))

  // now the password in our database is hashed...
  const correct = await user.correctPassword(password, user.password)

  if (!correct) next(new AppError('Incorrect email or password!', 401))

  //3) after checking send token to client
  const token = assignToken(user._id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100,
    ),
    httpOnly: true, // this will restrict us to manipulate the cookie in the browser in any way
  }

  if (process.env.NODE_ENV == 'production') cookieOptions.secure = true

  response.cookie('jwt', token, cookieOptions)

  // Remove the password from outputing in json response
  user.password = undefined

  response.status(200).json({
    status: 'success',
    token: token,
  })
})
exports.logout = (request, response) => {
  response.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  response.status(200).json({
    status: 'success',
  })
}
exports.protect = catchAsync(async (request, response, next) => {
  // 1) get the token and check it
  let token

  // Our JWT token us always sent from the browser cookies
  // which is automatically sent by browser with each request
  // IN API TESTING, we sent the token with Authorization header
  // with each request in production it is never done like this

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1]
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt
  }

  if (!token) {
    return next(new AppError('Not Logged-In!', 401))
  }
  // 2) validation of token, checking signature
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  )
  // this will catch the error if the token is not correct

  // 3) check if user still exist
  // what if user is no longer avaliable
  const currentUser = await User.findById(decodedPayload.id)
  if (!currentUser) return next(new AppError('User no longer exist', 401))

  // 4) check if user changed his password after token was issued
  //
  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(new AppError('Login with new password.', 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser
  next()
})

// Only for rendered pages
exports.isLoggedin = async (request, response, next) => {
  if (request.cookies.jwt) {
    try {
      //
      const decodedPayload = await promisify(jwt.verify)(
        //
        request.cookies.jwt,
        process.env.JWT_SECRET,
      )

      const currentUser = await User.findById(decodedPayload.id)
      if (!currentUser) return next()

      // Check if user changed his password after token was issued

      if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next()
      }

      // THERE IS A LOGGED IN USE

      // here passing the data to all the pug templates available
      response.locals.user = currentUser

      return next()
    } catch (error) {
      return next()
    }
  }
  next()
}

exports.restrictTo =
  (...roles) =>
  (request, response, next) => {
    // roles is an array, roles['admin','lead-guide'], role='user'
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You donot have permision to perform this action', 403),
      )
    }
    next()
  }

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // 1) GET user based on posted email
  const user = await User.findOne({ email: request.body.email })
  if (!user) {
    return next(new AppError('There is no user with this email', 404))
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  // will send this url in email to reset the password
  const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${resetToken}`

  // along with this email message
  const emailMessage = `Forgot your password? Submit your PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password then Ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token (valid for 10 Mins)',
      emailMessage,
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        'There was an error sending this email, Try again later!',
        500,
      ),
    )
  }

  response.status(200).json({
    status: 'Success',
    message: 'Token sent to email',
  })
})

exports.resetPassword = catchAsync(async (request, response, next) => {
  //  1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // to check the expiration of the token
  })

  //  2) If token has not expired and there is User, set the new password
  if (!user) {
    return next(new AppError('Token Expired X(', 400))
  }

  user.password = request.body.password
  user.confirmPassword = request.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  //  3) Update changedPasswordAt property for the user

  //  4) Log the user in , send JWT
  const token = assignToken(user._id)

  response.status(200).json({
    status: 'success',
    token: token,
  })
})
exports.updatePassword = catchAsync(async (request, response, next) => {
  // 1) get user from the collection
  const user = await User.findById(request.user.id).select('+password')
  // 2) check if posted password is correct
  if (!user.correctPassword(request.body.passwordCurrent, user.password)) {
    return next(new AppError('Incorrect password', 401))
  }
  // 3) update password
  user.password = request.body.password
  user.confirmPassword = request.body.confirmPassword
  await user.save()
  // User.findByIdAndUpdate() will not work as Intended

  // 4) log user in , send JWT
  const token = assignToken(user._id)

  response.status(200).json({
    status: 'success',
    token: token,
  })
})
