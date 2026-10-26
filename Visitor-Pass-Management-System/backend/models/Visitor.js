const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },

    phone: String,

    email: String,

    company: String,

    photo: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Visitor",
  visitorSchema
);