const mongoose = require("mongoose");

const passSchema = new mongoose.Schema(
{
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor"
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

 visitorName :  String,
  email: String,

  phone: String,

  company: String,

  passNumber: String,

  qrCode: String,


  issueDate: {
  type: Date,
  default: Date.now,
},
expiryDate: {
  type: Date,
  default: () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  },
},

  status: {
    type: String,
    default: "active"
  }
},
{
  timestamps: true
}
);

module.exports =
mongoose.model(
"Pass",
passSchema
);