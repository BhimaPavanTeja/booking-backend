const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")

router.post("/bookings/:bookingId/override", adminController.overrideBookingStatus)
router.get("/bookings", adminController.getAllBookings)

module.exports = router
