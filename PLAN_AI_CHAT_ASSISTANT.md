# AI Chat Assistant Implementation Plan

## Overview
Create an AI Chat Assistant using OpenAI API that provides personalized mentorship support with access to user data.

## Features to Implement

### 1. Floating AI Chat Widget
- Collapsible widget accessible from any page
- Persistent position (bottom-right corner)
- Quick access to AI assistance

### 2. AI Assistant in Chat Interface
- Toggle between human chat and AI chat
- Context-aware responses based on user's mentorship data
- Clear distinction between AI and human messages

### 3. AI Capabilities
- Answer FAQs about the mentorship platform
- Provide general mentorship guidance
- Study and career advice
- Personalized responses using user's mentorship context

---

## Implementation Steps

### Phase 1: Backend Implementation

#### 1.1 Add OpenAI integration to server/routes.py
- [ ] Install openai package
- [ ] Create `/api/ai/chat` endpoint for AI conversations
- [ ] Create `/api/ai/context` endpoint to fetch user context
- [ ] Implement conversation history handling
- [ ] Handle OpenAI API errors gracefully

### Phase 2: Frontend Components

#### 2.1 Create AI Chat Widget Component
- File: `client/src/components/AIChatWidget.jsx`
- [ ] Floating widget design
- [ ] Collapsible chat window
- [ ] Message history display
- [ ] Input field with send functionality
- [ ] Loading states
- [ ] Connection status indicator

#### 2.2 Create AI Chat Button Component  
- File: `client/src/components/AIChatButton.jsx`
- [ ] Integration for chat page
- [ ] Toggle between AI and human chat
- [ ] Context display

#### 2.3 Create AI Chat Page
- File: `client/src/AIChatPage.jsx`
- [ ] Full-page AI chat interface
- [ ] Quick action buttons
- [ ] Suggested questions

### Phase 3: Configuration Updates

#### 3.1 Update client/src/config.js
- [ ] Add AI chat endpoints
- [ ] Add AI context endpoint

#### 3.2 Update client/src/App.jsx
- [ ] Add route for `/ai-chat`

#### 3.3 Update client/src/components/Navbar.js
- [ ] Add navigation link to AI chat page

### Phase 4: Integration

#### 4.1 Update chat_page.jsx
- [ ] Add AI chat toggle option
- [ ] Smooth transition between chat modes

#### 4.2 Update chat.jsx
- [ ] Add AI assistant mode
- [ ] Context-aware responses display

---

## File Changes Summary

### New Files to Create:
1. `client/src/components/AIChatWidget.jsx`
2. `client/src/components/AIChatButton.jsx`
3. `client/src/AIChatPage.jsx`

### Files to Modify:
1. `server/routes.py` - Add AI endpoints
2. `client/src/config.js` - Add AI endpoints
3. `client/src/App.jsx` - Add AI chat route
4. `client/src/components/Navbar.js` - Add AI nav link
5. `client/src/components/messaging_components/chat/chat.jsx` - Add AI toggle
6. `client/src/chat_page.jsx` - Add AI chat option

### Dependencies:
- Backend: `openai` Python package
- Frontend: Already has FontAwesome and Bootstrap

---

## API Endpoints

### POST /api/ai/chat
Request body:
```json
{
  "message": "Your question here",
  "context": true // Whether to include user context
}
```

Response:
```json
{
  "response": "AI's response",
  "context_used": true
}
```

### GET /api/ai/context
Response:
```json
{
  "user": {
    "name": "User Name",
    "role": "student/mentor",
    "mentors": [...],
    "mentees": [...],
    "requests": [...]
  }
}
```

---

## Next Steps

1. **Install OpenAI Python package on server**
2. **Add OpenAI API key to server/.env**
3. **Implement backend endpoints**
4. **Create frontend components**
5. **Test integration**

