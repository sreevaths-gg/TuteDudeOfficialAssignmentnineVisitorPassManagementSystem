
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check whether the Authorization header contains a Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No valid Bearer token provided",
    });
  }

  // 2. Extract the token
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token is missing",
    });
  }

  // 3. Verify the token and decode its payload
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 4. Attach decoded token data to the request
    req.user = decoded;

    //console.log("Authenticated user:", req.user);

    // 5. Continue to the next middleware/controller
    return next();

  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
