<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Pottify Backend - Node.js Express Server

This is a Node.js Express server project for the Pottify backend API.

## Project Structure
- `server.js` - Main server file with Express configuration and routes
- `.env` - Environment variables (not committed to version control)
- `package.json` - Project dependencies and scripts
- `config/database.js` - Supabase database configuration
- `middleware/auth.js` - JWT authentication middleware
- `routes/auth.js` - Authentication routes (signup, login, profile)
- `database/setup.sql` - Database schema setup for Supabase

## Development Guidelines
- Use ES6+ features where appropriate
- Follow RESTful API conventions
- Implement proper error handling
- Use environment variables for configuration
- Include input validation for API endpoints
- Follow consistent code formatting and naming conventions
- Use JWT tokens for authentication
- Hash passwords using bcrypt before storing
- Validate user input thoroughly

## Key Dependencies
- Express.js - Web framework
- CORS - Cross-origin resource sharing
- dotenv - Environment variable management
- nodemon - Development server with auto-restart
- @supabase/supabase-js - Supabase client for database operations
- bcryptjs - Password hashing
- jsonwebtoken - JWT token generation and verification

## Authentication Flow
- Signup: Validate input → Hash password → Store in database → Return JWT token
- Login: Validate credentials → Compare hashed password → Return JWT token
- Protected routes: Verify JWT token → Allow access to authenticated endpoints

## API Endpoints
- `GET /` - Welcome message and server status
- `GET /api/health` - Health check endpoint
- `POST /api/auth/register` - User registration (requires: email, password, username, display_name)
- `POST /api/auth/login` - User authentication (requires: email, password)
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - User logout (protected)
- `GET /api/users` - Get users (example endpoint)
- `POST /api/users` - Create user (example endpoint)

## API Response Format
- Success responses include `data` object and `message` string
- Error responses include `code`, `message`, and `details` object
- Authentication responses include `token`, `refresh_token`, and `user` object
- User objects include: id, email, username, display_name, avatar_url, created_at, updated_at
