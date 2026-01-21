const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")

router.post("/bookings/:bookingId/override", adminController.overrideBookingStatus)

module.exports = router