const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Format: Bearer TOKEN
    // Split "Bearer TOKEN" and get the token part
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // ✅ VERIFY JWT using jwt.verify() with your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request object
    // Now all controller functions can access req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Continue to next middleware/route
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);

    // Handle different JWT errors with specific messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = authMiddleware;