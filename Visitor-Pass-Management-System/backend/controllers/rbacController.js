
const getMyAccess = (req, res) => {
  const permissions = {
    Admin: [
      "manage_users",
      "manage_staff",
      "manage_visitors",
      "manage_passes",
      "view_analytics",
      "verify_passes",
    ],
    Security: [
      "issue_passes",
      "verify_passes",
      "check_in_visitors",
      "check_out_visitors",
      "view_visitor_details",
    ],
    Employee: [
      "invite_visitors",
      "approve_visitors",
      "view_own_invitations",
    ],
    Visitor: [
      "pre_register",
      "view_own_pass",
      "view_own_status",
    ],
  };

  const role = req.user.role;

  return res.status(200).json({
    success: true,
    message: "Access verified successfully",
    user: {
      id: req.user.id || req.user._id,
      role,
    },
    permissions: permissions[role] || [],
  });
};

const verifyRoleAccess = (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Access granted for ${req.user.role}`,
    role: req.user.role,
    checkedAt: new Date().toISOString(),
  });
};

module.exports = {
  getMyAccess,
  verifyRoleAccess,
};
