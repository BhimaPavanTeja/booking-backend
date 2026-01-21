const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const bookingRoutes = require("./routes/bookingRoutes")
const providerRoutes = require("./routes/providerRoutes")
const adminRoutes = require("./routes/adminRoutes")

const app = express()

app.use(cors())
app.use(express.json())

require("dotenv").config()


connectDB()

app.use("/bookings", bookingRoutes)
app.use("/providers", providerRoutes)
app.use("/admin", adminRoutes)

app.get("/", (req, res) => {
  res.send("Booking system backend running")
})

const PORT = 5000

app.listen(PORT, () => {
  console.log("Server started on port " + PORT)
})



// const Booking = require("./models/Booking")
// const Provider = require("./models/Provider")
// const EventLog = require("./models/EventLog")

// console.log("Models loaded:", Booking.modelName, Provider.modelName, EventLog.modelName)