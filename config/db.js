const mongoose = require("mongoose")

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL

  try {
    await mongoose.connect(mongoUrl)
    console.log("MongoDB connected")
  } catch (error) {
    console.log("MongoDB connection failed")
    console.log(error.message)
    process.exit(1)
  }
}

module.exports = connectDB
