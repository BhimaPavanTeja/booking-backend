const mongoose = require("mongoose")

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "available"
  }
})

const Provider = mongoose.model("Provider", providerSchema)

module.exports = Provider
