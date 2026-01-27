# Learning Platform API

## Phase 2: Auth & User Services Complete

### ✅ Features Implemented

**Authentication**
- User registration with password hashing
- User login with JWT tokens  
- Token validation middleware
- Protected route system

**User Services**
- Profile retrieval
- Password hashing with bcrypt
- User lookup by ID/email

**Security**
- JWT token authentication
- Input validation with Joi
- CORS enabled
- Helmet security headers
- Error handling middleware

**API Endpoints**

```
POST /api/auth/register  - Register new user
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout
GET  /api/user/profile   - Get user profile (protected)
GET  /api/health         - Health check
GET  /api/protected      - Test protected route
```

### 📁 Project Structure
```
src/
├── config/
│   └── database.js       # PostgreSQL connection
├── models/
│   └── User.js          # User model and queries
├── services/
│   └── AuthService.js   # Auth business logic
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── validation.js    # Input validation
│   └── errorHandler.js  # Error handling
├── routes/
│   ├── auth.js          # Auth routes
│   ├── user.js          # User routes
│   └── index.js         # Health check routes
└── server.js            # Express server
```

### 🚀 Setup Instructions

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Set up PostgreSQL database
4. Run migrations: `npm run migrate`
5. Start server: `npm run dev`

### 🔐 Authentication Flow

1. Register: `POST /api/auth/register` → JWT token
2. Include token: `Authorization: Bearer <token>`
3. Access protected routes with valid token

Clean authentication base ready for Phase 3 implementation.