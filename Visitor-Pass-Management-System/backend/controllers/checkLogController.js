const CheckLog = require("../models/CheckLog");

exports.checkIn = async (req, res) => {
  try {
    const log = await CheckLog.create({
      
       visitorId: req.body.visitorId,
      passId: req.body.passId,
      securityOfficer: req.body.securityOfficer,
     // checkInTime: req.body.checkInTime
      checkInTime: new Date()
    });

  //  res.status(201).json(log);
   const checkLog = await CheckLog.findById(log._id)
      .populate("visitorId", "fullName email phone company")
      .populate({
    path: "passId",
    select: "passNumber appointmentId",
    populate: {
      path: "appointmentId",
      select: "appointmentId",
    },
  });

    res.status(201).json({
      success: true,
      message: "Visitor checked in successfully",
      checkLog: {
        checkLogId: checkLog._id,
        visitorId: checkLog.visitorId._id,
        visitorName: checkLog.visitorId.fullName,
        visitorEmail: checkLog.visitorId.email,
        visitorPhone: checkLog.visitorId.phone,
        company: checkLog.visitorId.company,
        passId: checkLog.passId,
         passNumber: log.passId.passNumber,
        securityOfficer: checkLog.securityOfficer,
        checkInTime: checkLog.checkInTime,
        checkOutTime: checkLog.checkOutTime
      }
    });
  } catch (error) {     res.status(500).json({       message: error.message     });   }
};

exports.checkOut = async (req, res) => {
  try {
    const log = await CheckLog.findByIdAndUpdate(       req.params.id,
      {         checkOutTime: new Date()       },       {         new: true       }     ).populate(
        "visitorId",
        "fullName email phone company"
      );;


     if (!log) {
      return res.status(404).json({
        success: false,
        message: "Check log not found"
      });
    }  
    res.status(200).json({
      success: true,
      message: "Visitor checked out successfully",
      checkLog: {
        checkLogId: log._id,
        visitorId: log.visitorId._id,
        visitorName: log.visitorId.fullName,
        visitorEmail: log.visitorId.email,
        visitorPhone: log.visitorId.phone,
        company: log.visitorId.company,
        passId: log.passId,
          passNumber: log.passId.passNumber,
        securityOfficer: log.securityOfficer,
        checkInTime: log.checkInTime,
        checkOutTime: log.checkOutTime
      }
    });

  } catch (error) {     res.status(500).json({       message: error.message     });   }
};

// Get All Check Logs
exports.getCheckLogs = async (req, res) => {
      try {
       
          const logs = await CheckLog.find()
          .populate(           "visitorId",           "fullName email phone company"           )
          .populate({
            
    path: "passId",
    select: "passNumber appointmentId",
    populate: {
      path: "appointmentId",
      select: "appointmentId",
    },
  });
      // console.log(logs );
      res.status(200).json({
        success: true,
        totalLogs: logs.length,
        logs: logs.map(log => ({
              checkLogId: log._id,
              visitorId: log.visitorId?._id,
              visitorName: log.visitorId?.fullName,
              visitorEmail: log.visitorId?.email,
              visitorPhone: log.visitorId?.phone,
              company: log.visitorId?.company,
              passId: log.passId._id,
                passNumber: log.passId.passNumber,
               appointmentId: log.passId.appointmentId._id,
              securityOfficer: log.securityOfficer,
              checkInTime: log.checkInTime,
              checkOutTime: log.checkOutTime
        }))
      });
       
      } catch (error) {
       
      res.status(500).json({
      success: false,
      message: error.message
      });
       
      }
};
 
// Get Single Check Log
exports.getCheckLogById = async (req, res) => {
            try {
             
            const log = await CheckLog.findById( req.params.id ).populate(
            "visitorId",
            "fullName email phone company"
            );
             
            if (!log) {
              return res.status(404).json({
              success: false,
              message: "Check log not found"
            });
            }
             
            res.status(200).json({
            success: true,
            checkLog: {
                checkLogId: log._id,
                visitorId: log.visitorId?._id,
                visitorName: log.visitorId?.fullName,
                visitorEmail: log.visitorId?.email,
                visitorPhone: log.visitorId?.phone,
                company: log.visitorId?.company,
                passId: log.passId,
                passNumber: log.passId.passNumber,
                securityOfficer: log.securityOfficer,
                checkInTime: log.checkInTime,
                checkOutTime: log.checkOutTime
            }
            });
             
} catch (error) {
 
      res.status(500).json({
              success: false,
              message: error.message
      });
 
}
};