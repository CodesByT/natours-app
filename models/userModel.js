const mongoose = require('mongoose')

const validator = require('validator')

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user must have a name'],
    trim: true,
    unique: true,
    maxlength: [40, 'A user name must have less or equal then 40 character'],
    minlength: [10, 'A user name must have less or equal then 40 character'],
  },
  email: {
    type: String,
    required: [true, 'a user must have an email address'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'a user must have a password'],
    minlength: [8, 'A pasword name must have atleast 10 characters'],
    select: false, // will avoid dislaying the password when getting the user list
    // validate: [
    //   validator.isStrongPassword,
    //   'Password must be 8 characters, with upper and lowercase',
    // ],
  },
  confirmPassword: {
    type: String,
    required: [true, 'a user must confirm the password'],
    validate: {
      validator: function (confimPassword) {
        // This only works with save
        return confimPassword === this.password
      },
      message: 'confirm password must be equal to the password feild',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

// using a pre-saving middleware to encrypt the user password
userSchema.pre('save', async function (next) {
  // if password is not been modified then there is no need of any encryption
  if (!this.isModified('password')) {
    return next()
  }
  // using B-Crypt algorithm for encryption
  this.password = await bcrypt.hash(this.password, 15)
  this.confirmPassword = undefined
  // no actual need for us to store it in the db,
  // it was just for the user validation
  next()
})
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next()
  }
  this.passwordChangedAt = Date.now() - 1000

  next()
})
// using Query middleware to avoid displaying in-active users
userSchema.pre(/^find/, function (next) {
  // this points to the currect query
  this.find({ active: { $ne: false } })
  next()
})

// This is an instance method available for each document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

// This is an instance method available for each document
userSchema.methods.changedPasswordAfter = function (JWTtimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    )
    return JWTtimeStamp < changedTimeStamp
  }
  //FALSE means password not changed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires,
  )

  return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
