const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const Pass = require("../models/Pass");
const CheckLog = require("../models/CheckLog");

exports.getStats = async (req, res) => {
  try {

    const totalVisitors =       await Visitor.countDocuments();

    const totalAppointments =       await Appointment.countDocuments();

    const totalPasses =       await Pass.countDocuments();

    const checkedInVisitors =       await CheckLog.countDocuments({
        checkOutTime: null
      });

    const checkedOutVisitors =       await CheckLog.countDocuments({
        checkOutTime: {
          $ne: null
        }
      });

    res.status(200).json({
      success: true,
      stats: {
        totalVisitors,
        totalAppointments,
        totalPasses,
        checkedInVisitors,
        checkedOutVisitors
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};