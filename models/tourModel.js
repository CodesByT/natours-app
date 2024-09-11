const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 character'],
      minlength: [10, 'A tour name must have less or equal then 40 character'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty level'],
      enum: {
        // this is a validator
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // THIS ONLY POINTS TO CURRENT  DOCUMENT ON NEW DOCUMENT CREATION
          return value < this.price
        },
        message: 'discount price ({VALUE}) should be below the actual price',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must start from 1'],
      max: [5, 'rating must be leen than equal to 5'],
    },
    ratingRequired: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // Embedding Locations in our tours document
    startLocation: {
      // GeoJSON user to specify the geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // References the User with _id
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
) // first parameter is for schema definition and next parameter is for the options

// SETTING VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
  // use of function() keyword here is because we need this keyword which is not available with an anonymous function
  // VIRTIUAL PROPERTIES are those which we calculate on the run time, usually these are the
  // properties which are drived from the other attributes

  return this.duration / 7
})
// Setting virtual middleware to get the reviews against a tour
// in the case of parent referencing
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'relatedTour', // relatedTour is the field name is our review model
  localField: '_id', // this _id is
})

// defining a mongoose middleware
tourSchema.pre('save', function (next) {
  // this middleware will run before an actual data save or create in the database
  this.slug = slugify(this.name, { lower: true })
  next()
})
// This will embedd the users in the tours document
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//   next()
// })

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })

  this.start = Date.now()
  next()
})

tourSchema.pre(/^find/, function (next) {
  // .populate() will fill the respective feild with the data from its given reference
  // this function is an absolute essential when working with referencing in mongoose

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })
  next()
})
// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline.unshift({ $match: { secretTour: { $ne: true } } })

  console.log(this.pipeline()) // point to the current aggregation function
  next()
})

tourSchema.post(/^find/, function (document, next) {
  console.log(`Query took: ${Date.now() - this.start} milliseconds`)
  console.log(document)
  next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
