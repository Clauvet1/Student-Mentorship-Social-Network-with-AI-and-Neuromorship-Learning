# AI Chat Implementation with Ollama - Testing Plan

## Current Status ✅
- Backend Ollama client is implemented in `server/routes.py`
- Frontend AIChatWidget.jsx is ready
- Frontend AIChatPage.jsx is ready with "Powered by Ollama (Local AI)" branding
- Configuration is set up in `client/src/config.js`

## What Needs to Be Done

### 1. Verify Ollama Installation and Model
- [ ] Check if Ollama is installed
- [ ] Ensure `llama2` model is pulled
- [ ] Start Ollama service

### 2. Start Required Services
- [ ] Start MongoDB (`mongod`)
- [ ] Start backend server (`uvicorn main:app --reload --port 3001`)
- [ ] Start frontend (`cd client && npm start`)

### 3. Test AI Chat on Webapp
- [ ] Login to the webapp
- [ ] Test floating AI Chat Widget (robot icon in bottom-right)
- [ ] Test full-page AI Chat (navigate to /ai-chat or use Navbar)
- [ ] Verify AI responses are working

## Commands to Run

### Step 1: Install and Setup Ollama (if not already done)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the llama2 model
ollama pull llama2

# Start Ollama service
ollama serve
```

### Step 2: Start MongoDB (in a separate terminal)
```bash
mongod
```

### Step 3: Start Backend Server (in a separate terminal)
```bash
cd /home/clauvet/school/project/Student-Mentorship-Social-Network-with-AI-and-Neuromorship-Learning/server
source venv/bin/activate
uvicorn main:app --reload --port 3001
```

### Step 4: Start Frontend (in a separate terminal)
```bash
cd /home/clauvet/school/project/Student-Mentorship-Social-Network-with-AI-and-Neuromorship-Learning/client
npm start
```

## Accessing the AI Chat

1. **Floating Widget**: Click the robot icon in the bottom-right corner of any page
2. **Full Page AI Chat**: 
   - Navigate to `/ai-chat` directly, OR
   - Login and look for "AI Chat Assistant" in the "More" dropdown menu

## Expected Behavior

When you send a message to the AI assistant:
1. The message is sent to `/api/ai/chat` endpoint
2. Backend uses Ollama client to generate a response
3. Response is returned and displayed in the chat window
4. Conversation history is maintained during the session

## Troubleshooting

If AI chat doesn't work:
1. **Ollama not running**: Start with `ollama serve`
2. **Model not found**: Run `ollama pull llama2`
3. **Connection refused (port 11434)**: Check Ollama is running on correct port
4. **Backend errors**: Check terminal where uvicorn is running

