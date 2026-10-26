const mongoose = require("mongoose");

const appointmentSchema =
new mongoose.Schema(
{
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor"
  },
 visitorName: {
    type: String,
    required: true
  },

  hostName: {
      type: String,
      required: true,
      trim: true
    },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  
  purpose: {
    type: String
  },

  visitDate: {
    type: Date
  },

  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected"
    ],
    default: "pending"
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model(
"Appointment",
appointmentSchema
);