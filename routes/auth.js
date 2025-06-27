const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate refresh token
const generateRefreshToken = async (userId) => {
  const refreshToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const { error } = await supabase
    .from('refresh_tokens')
    .insert([{
      user_id: userId,
      token: refreshToken,
      expires_at: expiresAt.toISOString()
    }]);

  if (error) {
    throw new Error('Failed to generate refresh token');
  }

  return refreshToken;
};

// Auth status endpoint
router.get('/', (req, res) => {
  const isConfigured = !!supabase;
  res.json({
    message: 'Pottify Authentication API',
    status: isConfigured ? 'Ready' : 'Configuration Required',    
    endpoints: {
      'POST /api/auth/register': 'Create a new user account',
      'POST /api/auth/login': 'Login with email and password', 
      'POST /api/auth/refresh': 'Refresh access token using refresh token',
      'GET /api/auth/profile': 'Get current user profile (protected)',
      'POST /api/auth/logout': 'Logout user (protected)'
    },
    configuration: {
      supabase_configured: isConfigured,
      required_env_vars: isConfigured ? null : [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY', 
        'JWT_SECRET'
      ]
    }
  });
});

// Middleware to check if Supabase is configured
const checkSupabaseConfig = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Database connection not configured. Please set up Supabase credentials in .env file.',
      setup: {
        required_env_vars: [
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'JWT_SECRET'
        ],
        instructions: 'Check the README.md for setup instructions'
      }
    });
  }
  next();
};

// Register route (signup)
router.post('/register', checkSupabaseConfig, async (req, res) => {
  try {
    const { email, password, username, display_name } = req.body;

    // Validate input
    if (!email || !password || !username || !display_name) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Email, password, username, and display_name are required',
        details: {}
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
        details: {}
      });
    }

    // Validate username format (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        code: 'INVALID_USERNAME',
        message: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens',
        details: {}
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long',
        details: {}
      });
    }

    // Check if user already exists by email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      return res.status(409).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
        details: {}
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUsername) {
      return res.status(409).json({
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'An account with this username already exists',
        details: {}
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          display_name: display_name.trim(),
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('id, email, username, display_name, avatar_url, created_at, updated_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        code: 'DATABASE_ERROR',
        message: 'Something went wrong while creating your account',
        details: {}
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      },
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
      details: {}
    });
  }
});

// Login route
router.post('/login', checkSupabaseConfig, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
        details: {}
      });
    }

    // Find user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, password_hash, created_at, updated_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
        details: {}
      });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
        details: {}
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
      details: {}
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    data: {
      user: req.user
    },
    message: 'Profile retrieved successfully'
  });
});

// Logout route (client-side token removal, but we can add token blacklisting here if needed)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more advanced setup, you would add the token to a blacklist
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client-side storage'
  });
});

// Refresh token endpoint
router.post('/refresh', checkSupabaseConfig, async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
        details: {}
      });
    }

    // Find and validate refresh token
    const { data: tokenData, error } = await supabase
      .from('refresh_tokens')
      .select('user_id, expires_at')
      .eq('token', refresh_token)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
        details: {}
      });
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      // Delete expired token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refresh_token);

      return res.status(401).json({
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired',
        details: {}
      });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, created_at, updated_at')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: {}
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate new refresh token and delete old one
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', refresh_token);

    const newRefreshToken = await generateRefreshToken(user.id);

    res.json({
      data: {
        token: newToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
      details: {}
    });
  }
});

module.exports = router;
