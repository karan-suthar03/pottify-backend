const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const songRoutes = require('./routes/song');

// Import database setup
const { setupBucket } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((a,b,c) => {
    console.log(`Request received: ${a.method} ${a.originalUrl}`);
    c();
});

// Serve static files from the downloads directory
app.use('/downloads', express.static('downloads'));

// Routes
app.use('/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/song', songRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Pottify Backend API!',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Example API routes
app.get('/users', (req, res) => {
  res.json({
    message: 'Users endpoint',
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.json({
    message: 'User created successfully',
    user: {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`
  });
});

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Health check: http://localhost:${PORT}/api/health`);
  
  // Setup bucket after server starts
  try {
    await setupBucket();
    console.log('✅ Server setup completed successfully');
  } catch (error) {
    console.error('❌ Error during server setup:', error.message);
    // Don't exit the process, just log the error
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
