
const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");

const passOwnershipMiddleware = async (req, res, next) => {
  try {
    const { passId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    if (!passId) {
      return res.status(400).json({
        success: false,
        message: "Pass ID is required",
      });
    }

    const pass = await Pass.findOne({ passId });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Pass not found",
      });
    }

    // Admin can access any pass.
    if (role === "Admin") {
      req.pass = pass;
      return next();
    }

    // Security can access passes for verification.
    if (role === "Security") {
      req.pass = pass;
      return next();
    }

    // Resolve the visitor record associated with this pass.
    const visitor = await Visitor.findById(pass.visitor);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor record not found",
      });
    }

    // Only the visitor linked to this account can view their pass.
    if (
      role === "Visitor" &&
      String(visitor.user) === String(userId)
    ) {
      req.pass = pass;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this pass",
    });
  } catch (error) {
    console.error("Pass ownership verification failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify pass access",
    });
  }
};

module.exports = passOwnershipMiddleware;
