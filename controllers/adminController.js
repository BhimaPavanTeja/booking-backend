const Booking = require("../models/Booking")
const Provider = require("../models/Provider")
const EventLog = require("../models/EventLog")

const overrideBookingStatus = async (req, res) => {
  const bookingId = req.params.bookingId
  const newStatus = req.body.newStatus

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const oldStatus = booking.status
    booking.status = newStatus
    booking.updatedAt = new Date()

    if (newStatus === "cancelled" || newStatus === "completed") {
      if (booking.providerId) {
        const provider = await Provider.findById(booking.providerId)
        if (provider) {
          provider.status = "available"
          await provider.save()
        }
      }
    }

    await booking.save()

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "admin-override"
    event.oldStatus = oldStatus
    event.newStatus = newStatus
    event.message = "Admin manually changed booking status"

    await event.save()

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to override booking" })
  }
}

module.exports = {
  overrideBookingStatus
}