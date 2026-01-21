const Booking = require("../models/Booking")
const Provider = require("../models/Provider")
const EventLog = require("../models/EventLog")

const getAssignedBookings = async (req, res) => {
  const providerId = req.params.providerId

  try {
    const bookings = await Booking.find({
      providerId: providerId,
      status: "assigned"
    })

    res.json(bookings)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to fetch bookings" })
  }
}

const acceptBooking = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "assigned") {
      return res.status(400).json({ message: "Booking is not in assigned state" })
    }

    const oldStatus = booking.status
    booking.status = "in-progress"
    booking.updatedAt = new Date()

    await booking.save()

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "accepted"
    event.oldStatus = oldStatus
    event.newStatus = "in-progress"
    event.message = "Provider accepted the booking"

    await event.save()

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to accept booking" })
  }
}

const rejectBooking = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "assigned") {
      return res.status(400).json({ message: "Booking is not in assigned state" })
    }

    const providerId = booking.providerId
    const oldStatus = booking.status

    booking.status = "rejected"
    booking.providerId = null
    booking.retryCount = booking.retryCount + 1
    booking.updatedAt = new Date()

    await booking.save()

    const provider = await Provider.findById(providerId)
    if (provider) {
      provider.status = "available"
      await provider.save()
    }

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "rejected"
    event.oldStatus = oldStatus
    event.newStatus = "rejected"
    event.message = "Provider rejected the booking"

    await event.save()

    if (booking.retryCount < 3) {
      const newProvider = await Provider.findOne({ status: "available" })

      if (newProvider) {
        const retryOldStatus = booking.status

        booking.providerId = newProvider._id.toString()
        booking.status = "assigned"
        booking.updatedAt = new Date()

        await booking.save()

        newProvider.status = "busy"
        await newProvider.save()

        const retryEvent = new EventLog()
        retryEvent.bookingId = booking._id.toString()
        retryEvent.eventType = "reassigned"
        retryEvent.oldStatus = retryOldStatus
        retryEvent.newStatus = "assigned"
        retryEvent.message = "Booking reassigned to another provider"

        await retryEvent.save()
      }
    }

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to reject booking" })
  }
}

module.exports = {
  getAssignedBookings,
  acceptBooking,
  rejectBooking
}
