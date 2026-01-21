const mongoose = require("mongoose")

const eventLogSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  oldStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const EventLog = mongoose.model("EventLog", eventLogSchema)

module.exports = EventLog
