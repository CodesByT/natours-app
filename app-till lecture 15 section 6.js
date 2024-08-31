const express = require('express')
const fs = require('fs')
const morgan = require('morgan')

const app = express()

//  1) MIDDLEWARE

// This express.json() is a middleware
// just a function that modifies the incoming request data
// middleware is called middleware because it stands between request and a response
app.use(express.json()) // adding to the middlewareStack
app.use(morgan('dev'))
app.use((request, response, next) => {
  // 1.express know that we are defining a middleware here
  // 2.and since this middleware is not specified with any route so this middleware is applied to each and every single route
  console.log('...Our Middleware()...')

  next() // we need to add the next() at the end of every middleware, otherwise the request will not proceed any more towards response
})
// app.use((request, response, next) => {
//   request.requestTime = new Date().toISOString()
//   console.log(request.requestTime)
//   next() // we need to add the next() at the end of every middleware, otherwise the request will not proceed any more towards response
// })
// getting the JSON as an array object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

//  2) ROUTE HANDLER // CONTROLLERS

const getAllTours = (request, response) => {
  // console.log(request.requestTime)
  response.status(200).json({
    status: 'success',
    result: tours.length,
    // reqTime: request.requestTime,
    data: {
      tours: tours,
    },
  })
}
// get the tour with id
// to make any parameter optional we simply need to put question mark in the front of it e.g. ("/tours/:id/formula?")
const getTourById = (request, response) => {
  // .params got all the variables in the our endpoint
  console.log(request.params)
  const id = request.params.id * 1 // using a trick to just convert the id string into an Integer

  if (id > tours.length) {
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    })
  }

  const tour = tours.find((element) => element.id === id)

  response.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  })
}
const addNewTour = (request, response) => {
  console.log(request.body)

  // Getting the json and adding into our JSON file
  const newId = tours[tours.length - 1].id + 1 // creating new id
  const newTour = Object.assign({ id: newId }, request.body) // giving new id

  tours.push(newTour) // appending

  // over-writing the file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (error) => {
      response.status(201).json({
        status: 'Success',
        data: {
          tour: newTour,
        },
      })
    }
  )
}
const helloFromServer = (request, response) => {
  response
    .status(200)
    .json({ message: 'HELLO FROM THE SERVER-SIDE', app: 'Natours' })
}
// with PUT we expect to replace te whole object with the new one
// with PATCH we expect to replace just the update attributes of the object
const updateTourById = (request, response) => {
  const id = request.params.id * 1 // using a trick to just convert the id string into an Integer

  if (id > tours.length) {
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    })
  }

  const tour = tours.find((element) => element.id === id)
  // ____REPLACE THE CHANGES IN JSON HERE_____
  response.status(200).json({
    status: 'success',
    data: {
      tour: '<< UPDATED TOUR >>',
    },
  })
}
const deleteTourById = (request, response) => {
  const id = request.params.id * 1
  if (id > tours.length) {
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    })
  }

  const tour = tours.find((element) => element.id === id)
  // _____DELETE THE OBJECT FROM JSON FILE_____
  response.status(204).json({
    status: 'success',
    data: null,
  })
}
const exampleeeeeeeee = () => {}

const getAllUsers = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
const createNewUsers = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
const getUser = () => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
const updateUser = () => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
const deleteUser = () => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  })
}
// app.get('/', helloFromServer)
// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTourById)
// app.post('/api/v1/tours', addNewTour) // We need MIDDLEWARE to get the request body from the client
// app.patch('/api/v1/tours/:id', updateTourById)
// app.delete('/api/v1/tours/:id', deleteTourById)

//  3) ROUTES

app.route('/').get(helloFromServer)

app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(addNewTour)
  .get(exampleeeeeeeee)

app.use((request, response, next) => {
  // middleware will when they are defined between the requests and responses
  console.log('...Our Second Middleware()...')
  next()
})

app
  .route('/api/v1/tours/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(deleteTourById)

app.route('/api/v1/users').get(getAllUsers).post(createNewUsers)
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser)

app.use((request, response, next) => {
  console.log('...Our Third Middleware()...')

  next()
})

//  4) SERVER
const port = 8000
app.listen(port, () => {
  console.log('App running')
})
