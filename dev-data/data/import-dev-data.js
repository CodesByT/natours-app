const mongoose = require('mongoose')
const fs = require('fs')

const dotenv = require('dotenv')

const Tour = require('./../../models/tourModel')

dotenv.config({ path: './config.env' })

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD,
// )

mongoose
  .connect(
    'mongodb+srv://tayyab:XPnfPx5$RFLajR!@cluster0.mb5sx.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0',
    {},
  )
  .then(() => {
    console.log('DB connection successful')
  })

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
)

const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data Loaded')
  } catch (error) {
    console.log(error)
  }
}

const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data Loaded')
  } catch (error) {
    console.log(error)
  }
}

console.log(process.argv)

//deleteData()

importData()
