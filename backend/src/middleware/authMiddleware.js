const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
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
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Verify user with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = authMiddleware;