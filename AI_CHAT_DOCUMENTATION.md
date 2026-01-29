# AI Chat System Documentation

## Overview

The AI Chat System is a local AI-powered mentorship assistant that helps students and mentors navigate the platform, get answers about mentorship, study tips, career advice, and more. It uses **Ollama** (local LLM) instead of cloud APIs for privacy and cost efficiency.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI CHAT SYSTEM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │   Frontend   │◄───────►│   Backend    │◄───────►│   Ollama     │
  │   (React)    │  HTTP   │   (FastAPI)  │  API    │   (Local)    │
  └──────────────┘         └──────────────┘         └──────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  AIChatPage  │         │   Routes     │         │   phi/       │
  │  AIChatWidget│         │ /api/ai/*    │         │ llama2       │
  └──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   MongoDB    │
                         │ (Knowledge)  │
                         └──────────────┘
```

---

## Components

### 1. Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **AIChatPage.jsx** | `/client/src/` | Full-page chat interface |
| **AIChatWidget.jsx** | `/client/src/components/` | Floating widget chat |
| **config.js** | `/client/src/` | API URL configuration |

### 2. Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Send message to AI assistant |
| `/api/ai/context` | GET | Get user context for AI |
| `/api/ai/clear-history` | POST | Clear conversation history |

### 3. Key Files

| File | Location | Purpose |
|------|----------|---------|
| **routes.py** | `/server/` | AI chat endpoint logic |
| **knowledge_base.py** | `/server/` | Scholarships & internships data |
| **neuromorphic_engine.py** | `/server/` | Neuromorphic AI processing |
| **authentication.py** | `/server/` | JWT token handling |

---

## Data Flow

```
User Message
    │
    ▼
┌─────────────────┐
│  React Frontend │
│  (AIChatPage)   │
└────────┬────────┘
         │ POST /api/ai/chat
         │ { message, include_context }
         ▼
┌─────────────────┐
│  FastAPI        │
│  Authentication │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get User       │
│  Context        │──────► MongoDB
└────────┬────────┘         (Mentors, Mentees, Requests)
         │
         ▼
┌─────────────────┐
│  Build System   │◄──── Knowledge Base
│  Message        │    (Scholarships, Internships)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Call Ollama    │──────► Local LLM
│  (OpenAI API)   │       (phi/llama2)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return         │
│  Response       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │
│  Display AI     │
│  Response       │
└─────────────────┘
```

---

## User Context Integration

The AI uses the logged-in user's context to personalize responses:

```python
# Context includes:
{
    "user": {
        "name": "John Doe",
        "role": "student",  # or "mentor"
        "specialty": "Computer Science",
        "bio": "...",
        "school": "University of Yaoundé",
        "department": "Computer Science"
    },
    "mentors": [
        {"name": "Dr. Smith", "specialty": "AI/ML"}
    ],
    "mentees": [...],
    "pending_requests": [...]
}
```

---

## Configuration

### Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=phi  # Default model
```

---

## Knowledge Base

The system includes a built-in knowledge base with:

- **8 Cameroonian Universities** with scholarship information
- **10 Companies** with internship opportunities
- **Searchable keywords** for scholarships and internships
- **Query classification** (scholarship vs internship vs general)

---

## Technical Highlights

| Feature | Technology |
|---------|------------|
| **Frontend** | React 18, Bootstrap 5 |
| **Backend** | FastAPI, Python 3.12 |
| **Database** | MongoDB |
| **AI Engine** | Ollama (Local LLM) |
| **Authentication** | JWT (HS256) |
| **Real-time** | Pusher (messaging) |
| **Icons** | FontAwesome |

---

## Security Features

1. **JWT Authentication** - All AI endpoints require valid token
2. **Context Isolation** - Users only see their own data
3. **No External APIs** - All processing is local (Ollama)
4. **Input Sanitization** - Basic input validation on all endpoints

---

## Quick Start

```bash
# 1. Start MongoDB (local)
mongod

# 2. Start Ollama
ollama serve
ollama pull phi  # or llama2

# 3. Start Backend
cd server
source venv/bin/activate
uvicorn main:app --reload --port 3001

# 4. Start Frontend
cd client
npm start
```

---

## API Response Format

```json
// POST /api/ai/chat
{
    "response": "Hello! I'm your AI Mentorship Assistant...",
    "context_used": true
}

// GET /api/ai/context
{
    "user": { ... },
    "mentors": [...],
    "mentees": [...],
    "pending_requests": [...],
    "platform_info": { ... }
}
```

