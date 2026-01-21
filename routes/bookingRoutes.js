const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/bookingController")

router.post("/", bookingController.createBooking)
router.post("/:bookingId/complete", bookingController.completeBooking)
router.post("/:bookingId/cancel", bookingController.cancelBooking)
router.post("/:bookingId/no-show", bookingController.noShow)
router.get("/:bookingId/history", bookingController.getBookingHistory)
router.get("/:bookingId", bookingController.getBookingById)

module.exports = router
