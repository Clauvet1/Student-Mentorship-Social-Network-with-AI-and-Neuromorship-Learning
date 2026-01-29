# Chat System Presentation

## Overview
The Chat System enables real-time messaging between mentors and mentees with AI integration for intelligent assistance.

---

## Chat Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      CHAT SYSTEM                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────────────┐    │
│   │  Mentor  │◄──►│  Pusher  │◄──►│      Mentee      │    │
│   └──────────┘    │  (Real)  │    └──────────────────┘    │
│                   └──────────┘                            │
│                         │                                 │
│                         ▼                                 │
│                   ┌──────────┐                            │
│                   │  MongoDB │                            │
│                   │ (History)│                            │
│                   └──────────┘                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Chat Features

### 1. Real-time Messaging
- Instant message delivery via Pusher
- Online/offline status indicators
- Message read receipts

### 2. Conversation Management
- View all conversations
- Search conversations
- Clear chat history

### 3. AI Integration
- AI Mentorship Assistant
- Context-aware responses
- Knowledge base queries

---

## User Interface

```
┌─────────────────────────────────────────┐
│  Chat Page                              │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  Conversation List             │    │
│  │  ─────────────────────────────│    │
│  │  ● John (Mentor)              │    │
│  │  ● Sarah (Mentee)             │    │
│  │  ● Dr. Smith (Mentor)         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Chat Window                   │    │
│  │  ─────────────────────────────│    │
│  │  ┌─────────────────────────┐  │    │
│  │  │  Hello! How can I help  │  │    │
│  │  │  you today?             │  │    │
│  │  └─────────────────────────┘  │    │
│  │           [User message...]   │    │
│  │  ┌─────────────────────────┐  │    │
│  │  │  Thanks for the help!   │  │    │
│  │  └─────────────────────────┘  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [Type message...]        [Send]│    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## Data Flow

```
1. User sends message
   │
   ▼
2. Frontend validates & displays message
   │
   ▼
3. POST /api/messages/send
   │
   ▼
4. MongoDB stores message
   │
   ▼
5. Pusher triggers real-time event
   │
   ▼
6. Recipient receives notification
   │
   ▼
7. Message displayed in chat window
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages/send` | POST | Send a message |
| `/api/messages/{user1}/{user2}` | GET | Get conversation |
| `/api/conversations` | GET | Get all conversations |
| `/api/active-mentorships` | GET | Get active mentorship pairs |

---

## Key Components

### Frontend
- `chat_page.jsx` - Main chat interface
- `chat_list.jsx` - Conversation list
- `chat_detail.jsx` - Individual chat view
- `AIChatWidget.jsx` - AI assistant widget

### Backend
- `routes.py` - Message endpoints
- `database.py` - MongoDB operations
- `pusher_client.py` - Real-time events

---

## Database Schema

```javascript
// Messages Collection
{
    _id: ObjectId,
    sender_id: String,
    receiver_id: String,
    content: String,
    timestamp: Date,
    read: Boolean
}

// Mentorships Collection
{
    _id: ObjectId,
    mentor_id: String,
    student_id: String,
    created_at: Date,
    status: String
}
```

---

## Presentation Highlights

1. **Real-time Communication** - Instant messaging via Pusher
2. **Mentorship Focus** - Chat only between connected mentor-mentee pairs
3. **AI Assistant** - Context-aware help for navigation and questions
4. **Persistent History** - All messages stored in MongoDB
5. **Responsive Design** - Works on desktop and mobile

---

## Technologies Used

| Component | Technology |
|-----------|------------|
| Frontend | React, Bootstrap |
| Backend | FastAPI, Python |
| Database | MongoDB |
| Real-time | Pusher |
| AI | Ollama (Local) |

