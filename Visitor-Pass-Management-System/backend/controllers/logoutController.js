
exports.logout = async (req, res) => {
  try {
    // For stateless JWT authentication, the client must
    // remove its stored token when logging out.
    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed."
    });
  }
};
