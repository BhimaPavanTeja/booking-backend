const express = require("express")
const router = express.Router()
const providerController = require("../controllers/providerController")

router.get("/:providerId/bookings", providerController.getAssignedBookings)
router.post("/bookings/:bookingId/accept", providerController.acceptBooking)
router.post("/bookings/:bookingId/reject", providerController.rejectBooking)

module.exports = router