const Appointment = require("../models/Appointment");

// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    const result =       await Appointment.findById(         appointment._id       ).populate(
        "visitorId",         "fullName hostName email phone company"       );

   // res.status(201).json({ success: true,  appointment,     });
   res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: {
        appointmentId: result._id,
        visitorId: result.visitorId._id,
        visitorName: result.visitorId.fullName,
        visitorEmail: result.visitorId.email,
        visitorPhone: result.visitorId.phone,
        company: result.visitorId.company,
       
        hostName: result.hostName,
        purpose: result.purpose,
        visitDate: result.visitDate,
        status: result.status
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Appointments
exports.getAppointments = async (req, res) => {
  try {
  //  const appointments = await Appointment.find();
  //  res.status(200).json({       success: true,       appointments,     });
  const appointments =
      await Appointment.find()
      .populate(
        "visitorId",
        "fullName hostName email phone company"
      );

    res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      appointments: appointments.map(app => ({
        appointmentId: app._id,
        visitorId: app.visitorId._id,
        visitorName: app.visitorId.fullName,
        visitorEmail: app.visitorId.email,
        visitorPhone: app.visitorId.phone,
        company: app.visitorId.company,
        hostName: app.hostName,
        purpose: app.purpose,
        visitDate: app.visitDate,
        status: app.status
      }))
    });
  } 
  catch (error) {     res.status(500).json({  success: false,   message: error.message,     });   }
};

// // Approve Appointment
// exports.approveAppointment = async (req, res) => {
//   try {
//     const appointment = await Appointment.findByIdAndUpdate(
//       req.params.id,       { status: "Approved" },       { new: true }     );

//     res.status(200).json({       success: true,       appointment,     });
//   } catch (error) {     res.status(500).json({   success: false,       message: error.message,  });
//   }
// };

// // Reject Appointment
// exports.rejectAppointment = async (req, res) => {
//   try {
//     const appointment = await Appointment.findByIdAndUpdate( 
//       req.params.id,       { status: "Rejected" },       { new: true }     );
//       res.status(200).json({       success: true,       appointment,     });
//   } 
//   catch (error) {  res.status(500).json({ success: false, message: error.message,     });   }
// };


//const Appointment = require("../models/Appointment");

// Approve Appointment
exports.approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment approved successfully",
      appointment,
    });
  } catch (error) {
    console.error("Approve appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Appointment
exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
      appointment,
    });
  } catch (error) {
    console.error("Reject appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
