const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  providerId: {
    type: String,
    default: null
  },
  serviceType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "pending"
  },
  retryCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking
