const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review hould have a message'],
    },
    rating: {
      type: Number,
      required: [true, 'Review should have a rating value'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    relatedTour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongs to a tour'],
    },
    relatedUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be from a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'relatedTour',
  //   select: 'name',
  // }).populate({
  //   path: 'relatedUser',
  //   select: 'name',
  // })

  this.populate({
    path: 'relatedUser',
    select: 'name',
  })

  next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
