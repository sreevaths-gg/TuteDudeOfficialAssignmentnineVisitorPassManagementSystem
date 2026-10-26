const Visitor = require("../models/Visitor");
//Get Single  Visitor  Details
const createVisitor = async (req, res) => {

  try {
    const visitor =     await Visitor.create({
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      company: req.body.company,// Save the uploaded photo path in MongoDB
      photo: req.file         ? `/uploads/visitors/${req.file.filename}`         : null,
    });
    res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      visitor: {
        visitorId: visitor._id,
        fullName: visitor.fullName,
        phone: visitor.phone,
        email: visitor.email,
        company: visitor.company,
        photo: visitor?.photo || "Not Available",
        createdAt: visitor.createdAt,
      }
    });
  //  res.status(201).json(visitor);
  } 
  catch (error) {     res.status(500).json({       message: error.message     });    }

};
//Get All Visitor  Details
const getVisitors = async (req, res) => {

  try {
    const visitors =     await Visitor.find();
     res.status(200).json({
      success: true,
      totalVisitors: visitors.length,
      visitors: visitors.map(visitor => ({
        visitorId: visitor._id,
        fullName: visitor.fullName,
        phone: visitor.phone,
        email: visitor.email,
        company: visitor.company,
        photo: visitor?.photo || "Not Available",
        createdAt: visitor.createdAt
      }))
    });

  //  res.json(visitors);

  } catch (error) {     res.status(500).json({       message: error.message     });   }

};
//Get My Visitor Details
const getMyVisitor = async (req, res) => {
 

  try {
    // Assumes the logged-in user's email matches their visitor record.
    const visitor = await Visitor.findOne({
      email: req.user.email,
    });

    if (!visitor) {
      return res.status(404).json({
        message: "Your visitor profile was not found.",
      });
    }

    return res.status(200).json({ visitor });
  } catch (error) {
    console.error("Get my visitor error:", error);
    return res.status(500).json({
      message: "Unable to load your visitor profile.",
    });
  }
};




module.exports = {   createVisitor,  getMyVisitor, getVisitors };