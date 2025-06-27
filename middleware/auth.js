const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  // Check if Supabase is configured
  if (!supabase) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Database connection not configured. Please set up Supabase credentials.'
    });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Verify user still exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, created_at, updated_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token verification failed' 
    });
  }
};

module.exports = { authenticateToken };
