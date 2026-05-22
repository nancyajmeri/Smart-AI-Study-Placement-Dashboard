# 📚 Study Planner Backend API

Node.js + Express + MongoDB backend for the Study Planner app.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Run the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Signup, Login, Me
│   └── plannerController.js# Sessions, Goals, Stats
├── middleware/
│   ├── authMiddleware.js   # JWT protect middleware
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── User.js             # User schema
│   ├── StudySession.js     # Study session schema
│   └── Goal.js             # Goal schema
├── routes/
│   ├── authRoutes.js       # /api/auth/*
│   └── plannerRoutes.js    # /api/planner/*
└── index.js                # App entry point
```

---

## 🔐 Auth API

| Method | Endpoint           | Description         | Auth Required |
|--------|--------------------|---------------------|---------------|
| POST   | /api/auth/signup   | Register new user   | No            |
| POST   | /api/auth/login    | Login user          | No            |
| GET    | /api/auth/me       | Get current user    | Yes           |

### Signup
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response includes a JWT token — send it in headers for protected routes:**
```
Authorization: Bearer <token>
```

---

## 📅 Study Planner API

All routes require `Authorization: Bearer <token>` header.

### Sessions

| Method | Endpoint                      | Description         |
|--------|-------------------------------|---------------------|
| GET    | /api/planner/sessions         | Get all sessions    |
| POST   | /api/planner/sessions         | Create session      |
| PUT    | /api/planner/sessions/:id     | Update session      |
| DELETE | /api/planner/sessions/:id     | Delete session      |

**GET Query Filters:**
- `?status=planned|completed|skipped`
- `?subject=Math`
- `?from=2024-01-01&to=2024-01-31`

**Create Session Body:**
```json
{
  "subject": "Mathematics",
  "topic": "Calculus - Integration",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "duration": 120,
  "priority": "high",
  "notes": "Focus on definite integrals",
  "status": "planned"
}
```

### Goals

| Method | Endpoint                  | Description      |
|--------|---------------------------|------------------|
| GET    | /api/planner/goals        | Get all goals    |
| POST   | /api/planner/goals        | Create goal      |
| PUT    | /api/planner/goals/:id    | Update goal      |
| DELETE | /api/planner/goals/:id    | Delete goal      |

**Create Goal Body:**
```json
{
  "title": "Master Calculus",
  "subject": "Mathematics",
  "targetHours": 40,
  "deadline": "2024-03-01"
}
```

### Stats

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/planner/stats    | Get dashboard stats  |

**Stats Response:**
```json
{
  "success": true,
  "stats": {
    "totalSessions": 20,
    "completedSessions": 15,
    "completionRate": 75,
    "subjectBreakdown": [
      { "_id": "Math", "totalMinutes": 600, "count": 10 }
    ],
    "activeGoals": 3
  }
}
```

---

## 🛡️ Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

Common status codes:
- `400` Bad Request (validation error)
- `401` Unauthorized (missing/invalid token)
- `404` Not Found
- `500` Server Error
