const Visitor = require("../models/Visitor");
const Pass = require("../models/Pass");

const generateCSV = require(
  "../utils/csvGenerator"
);

// Export Visitors
exports.exportVisitors = async (
  req,
  res
) => {
  try {

    const visitors =
      await Visitor.find().lean();

    const fields = [
      "_id",
      "fullName",
      "email",
      "phone",
      "company"
    ];

    const filePath =
      await generateCSV(
        visitors,
        fields,
        "visitors.csv"
      );

    res.download(filePath);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Export Passes
exports.exportPasses = async (  req,   res ) => {
  try {

    const passes =
      await Pass.find().lean();

    const fields = [
      "_id",
      "visitorName",
      "email",
      "phone",
      "company",
      "passNumber",
      "status"
    ];

    const filePath =       await generateCSV(
        passes,
        fields,
        "passes.csv"
      );

    res.download(filePath);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


 // Export logged-in visitor's details
exports.exportMyVisitor = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // Find the visitor linked to the logged-in user.
    const visitor = await Visitor.findOne({
       email: req.user.email,
    }).lean();

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor details not found",
      });
    }

    const fields = [
      "_id",
      "fullName",
      "email",
      "phone",
      "company",
    ];

    const filePath = await generateCSV(
      visitor,
      fields,
      "my-visitor.csv"
    );

    return res.download(filePath);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.exportMyPass = async (req, res) => {
  try {
    // Find the logged-in visitor
    const visitor = await Visitor.findOne({
      email: req.user.email,
    }).lean();

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor profile not found.",
      });
    }

    // Find the generated pass linked to this visitor
    const pass = await Pass.findOne({
      visitorId: visitor._id,
    }).lean();

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "No generated pass found for this visitor.",
      });
    }

    const fields = [
      "_id",
      "visitorName",
      "email",
      "phone",
      "company",
      "passNumber",
      "issueDate",
      "expiryDate",
      "status",
    ];

    const filePath = await generateCSV(
      pass,
      fields,
      "my-pass.csv"
    );

    return res.download(filePath, "my-pass.csv", (error) => {
      if (error) {
        console.error("CSV download error:", error);
      }
    });
  } catch (error) {
    console.error("Export my pass error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
