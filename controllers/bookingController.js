const Booking = require("../models/Booking")
const Provider = require("../models/Provider")
const EventLog = require("../models/EventLog")

const createBooking = async (req, res) => {
  const customerId = req.body.customerId
  const serviceType = req.body.serviceType

  if (!customerId || !serviceType) {
    return res.status(400).json({ message: "customerId and serviceType are required" })
  }

  try {
    const booking = new Booking()
    booking.customerId = customerId
    booking.serviceType = serviceType
    booking.status = "pending"

    await booking.save()

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "created"
    event.newStatus = "pending"
    event.message = "Booking created by customer"

    await event.save()

    const provider = await Provider.findOne({ status: "available" })

    if (provider) {
      booking.providerId = provider._id.toString()
      booking.status = "assigned"
      booking.updatedAt = new Date()

      await booking.save()

      provider.status = "busy"
      await provider.save()

      const assignEvent = new EventLog()
      assignEvent.bookingId = booking._id.toString()
      assignEvent.eventType = "assigned"
      assignEvent.oldStatus = "pending"
      assignEvent.newStatus = "assigned"
      assignEvent.message = "Provider auto-assigned"

      await assignEvent.save()
    }

    res.status(201).json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

const completeBooking = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "in-progress") {
      return res.status(400).json({ message: "Booking is not in progress" })
    }

    const oldStatus = booking.status
    booking.status = "completed"
    booking.updatedAt = new Date()

    await booking.save()

    if (booking.providerId) {
      const provider = await Provider.findById(booking.providerId)
      if (provider) {
        provider.status = "available"
        await provider.save()
      }
    }

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "completed"
    event.oldStatus = oldStatus
    event.newStatus = "completed"
    event.message = "Booking completed"

    await event.save()

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to complete booking" })
  }
}

const cancelBooking = async (req, res) => {
  const bookingId = req.params.bookingId
  const cancelledBy = req.body.cancelledBy

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already closed" })
    }

    const oldStatus = booking.status
    booking.status = "cancelled"
    booking.updatedAt = new Date()

    await booking.save()

    if (booking.providerId) {
      const provider = await Provider.findById(booking.providerId)
      if (provider) {
        provider.status = "available"
        await provider.save()
      }
    }

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "cancelled"
    event.oldStatus = oldStatus
    event.newStatus = "cancelled"
    event.message = "Booking cancelled by " + cancelledBy

    await event.save()

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to cancel booking" })
  }
}

const noShow = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "assigned" && booking.status !== "in-progress") {
      return res.status(400).json({ message: "No-show not valid in this state" })
    }

    const providerId = booking.providerId
    const oldStatus = booking.status

    booking.status = "no-show"
    booking.providerId = null
    booking.retryCount = booking.retryCount + 1
    booking.updatedAt = new Date()

    await booking.save()

    if (providerId) {
      const provider = await Provider.findById(providerId)
      if (provider) {
        provider.status = "available"
        await provider.save()
      }
    }

    const event = new EventLog()
    event.bookingId = booking._id.toString()
    event.eventType = "no-show"
    event.oldStatus = oldStatus
    event.newStatus = "no-show"
    event.message = "Provider did not show up"

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
        retryEvent.message = "Booking reassigned after no-show"

        await retryEvent.save()
      }
    }

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to mark no-show" })
  }
}

const getBookingHistory = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const events = await EventLog.find({ bookingId: bookingId }).sort({ createdAt: 1 })

    res.json(events)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to fetch history" })
  }
}

const getBookingById = async (req, res) => {
  const bookingId = req.params.bookingId

  try {
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json(booking)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to fetch booking" })
  }
}


module.exports = {
  createBooking,
  completeBooking,
  cancelBooking,
  noShow,
  getBookingHistory,
  getBookingById
}

