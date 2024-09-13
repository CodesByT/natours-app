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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

// Creating the static method
reviewSchema.statics.calculateAverageRatings = async function (tour_id) {
  const stats = awaitthis.aggregate([
    {
      $match: { tour: tour_id },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tour_id, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    })
  } else {
    await Tour.findByIdAndUpdate(tour_id, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.post('save', function () {
  this.constructor.calculateAverageRatings(this.tour)
}) // In post middleware we do not have next()

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne()
  next()
})
reviewSchema.post(/^findOneAnd/, async function (next) {
  //
  //  this.r = await this.findOne() DOES NOT WORK HERE BECAUSE AT THIS POINT QUERY IS ALREADY EXECUTED

  await this.r.constructor.calculateAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
