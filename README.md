# Pottify Backend

A Node.js Express server providing API endpoints for the Pottify application.

## 🚀 Features

- RESTful API endpoints
- CORS enabled for cross-origin requests
- Environment-based configuration
- Error handling middleware
- Health check endpoint
- Development server with auto-restart
- **User Authentication (Login/Signup)**
- **PostgreSQL database with Supabase**
- **JWT token-based authentication**
- **Password hashing with bcrypt**

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and keys
   - Run the SQL script in `database/setup.sql` in your Supabase SQL editor

4. **Configure environment variables:**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Generate a JWT secret:
     ```bash
     npm run generate-jwt
     ```
   - Edit `.env` file and replace placeholder values with your actual Supabase credentials

5. **Test the database connection:**
   ```bash
   npm run test-db
   ```

## 🏃‍♂️ Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📡 API Endpoints

### General
- `GET /` - Welcome message and server status
- `GET /api/health` - Health check endpoint

### Authentication
- `GET /api/auth` - Authentication service status and configuration
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `GET /api/auth/profile` - Get current user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Users (Example endpoints)
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### 📝 API Usage Examples

#### Register (Signup)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "newpassword",
    "username": "newusername",
    "display_name": "New User Display Name"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "new_user_id",
      "email": "newuser@example.com",
      "username": "newusername",
      "display_name": "New User Display Name",
      "avatar_url": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Registration successful"
}
```

**Error Response:**
```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "An account with this email already exists",
  "details": {}
}
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "newpassword"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "newuser@example.com",
      "username": "newusername",
      "display_name": "New User Display Name",
      "avatar_url": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Login successful"
}
```

#### Get Profile (requires token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "user_id",
      "email": "newuser@example.com",
      "username": "newusername",
      "display_name": "New User Display Name",
      "avatar_url": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Profile retrieved successfully"
}
```

#### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token_here"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "new_jwt_token_here",
    "refresh_token": "new_refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "newuser@example.com",
      "username": "newusername",
      "display_name": "New User Display Name",
      "avatar_url": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "message": "Token refreshed successfully"
}
```

## 🏗️ Project Structure

```
pottify_backend/
├── server.js                  # Main server file
├── package.json               # Project dependencies and scripts
├── .env                      # Environment variables (not committed)
├── .env.example              # Environment template file
├── .gitignore                # Git ignore rules
├── README.md                 # Project documentation
├── test-connection.js        # Database connection test
├── generate-jwt-secret.js    # JWT secret generator
├── config/
│   └── database.js           # Supabase configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   └── auth.js              # Authentication routes
└── database/
    └── setup.sql            # Database schema setup
```

## 🔧 Configuration

Environment variables can be configured in the `.env` file:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret key for JWT token signing

## 🐛 Error Handling

The server includes comprehensive error handling:
- Global error middleware for catching unhandled errors
- 404 handler for undefined routes
- Structured error responses in JSON format

## 📝 Development

### Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (to be implemented)
- `npm run test-db` - Test database connection
- `npm run generate-jwt` - Generate a secure JWT secret

### Code Style
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Use environment variables for configuration

## 🚀 Deployment

1. Set environment variables for production
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
