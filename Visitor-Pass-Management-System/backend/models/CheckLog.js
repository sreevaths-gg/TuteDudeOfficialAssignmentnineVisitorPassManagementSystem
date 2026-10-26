const mongoose = require("mongoose");

const checkLogSchema = new mongoose.Schema(
{
   visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor"
  },
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pass"
  },

  checkInTime: Date,

  checkOutTime: Date,

  securityOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model( "CheckLog", checkLogSchema );