const jwt = require("jsonwebtoken");
JWT_SECRET_KEY='anish@123'
 


const verifyLogin = (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.access_token;
   

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Please log in.",
        data: [],
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        status: false,
        message: "Invalid token. Please log in again.",
        data: [],
      });
    }

    // Attach user details to request object for later use
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
   // res.send(token)
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e,
      data: [],
    });
  }
};

module.exports = verifyLogin;
