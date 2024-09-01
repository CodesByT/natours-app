class APIFeatures {
  constructor(queryForMongo, queryFromRequest) {
    this.queryForMongo = queryForMongo
    this.queryFromRequest = queryFromRequest
  }

  filter() {
    const queryObj = { ...this.queryFromRequest } // creating new object
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((element) => delete queryObj[element])

    let queryString = JSON.stringify(queryObj)

    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g, // using regular expressions
      (match) => `$${match}`,
    )

    this.queryForMongo = this.queryForMongo.find(JSON.parse(queryString))

    return this // THIS KEYWORD WILL HELP TO CHAIN THE FUNCTIONS WHILE CREATING THE OBJECT
  }

  sort() {
    // let query = Tour.find(JSON.parse(queryString))

    if (this.queryFromRequest.sort) {
      const sortBy = this.queryFromRequest.query.split(',').join(' ')
      this.queryForMongo = this.queryForMongo.sort(sortBy)
    } else {
      // sort the list according to the latest entry in descending order
      this.queryForMongo = this.queryForMongo.sort('-created')
    }

    return this // THIS KEYWORD WILL HELP TO CHAIN THE FUNCTIONS WHILE CREATING THE OBJECT
  }

  limit() {
    if (this.queryFromRequest.feilds) {
      const selectiveFeilds = this.queryFromRequest.feilds.split(',').join(' ')
      this.queryForMongo = this.queryForMongo.select(selectiveFeilds)
    } else {
      // excluding some of the fields to sent the to the client
      this.queryForMongo = this.queryForMongo.select('-__v') // THIS MINUS WILL EXCLUDE THIS FIELD
    }
    return this // THIS KEYWORD WILL HELP TO CHAIN THE FUNCTIONS WHILE CREATING THE OBJECT
  }

  async paginate() {
    const pageNo = this.queryFromRequest.page * 1 || 1
    const limitNo = this.queryFromRequest.limit * 1 || 100

    this.queryForMongo = this.queryForMongo
      .skip((pageNo - 1) * limitNo)
      .limit(limitNo)

    if (this.queryFromRequest.page) {
      const numTours = await Tour.countDocuments()

      if ((pageNo - 1) * limitNo >= numTours)
        throw new Error('This page does not exist')
    }

    return this // THIS KEYWORD WILL HELP TO CHAIN THE FUNCTIONS WHILE CREATING THE OBJECT
  }
}
module.exports = APIFeatures
