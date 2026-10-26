
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.log("Missing authenticated user or role:", req.user);

      return res.status(401).json({
        success: false,
        message: "Unauthorized. User authentication required.",
      });
    }

    const userRole = String(req.user.role).toLowerCase();
    const allowedRoles = roles.map((role) => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
        User_Role: req.user.role,
        Roles_That_Can_Access: roles,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
