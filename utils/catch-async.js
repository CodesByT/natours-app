//

//

module.exports = (func) => (request, response, next) => {
  func(request, response, next).catch((error) => next(error))
}
