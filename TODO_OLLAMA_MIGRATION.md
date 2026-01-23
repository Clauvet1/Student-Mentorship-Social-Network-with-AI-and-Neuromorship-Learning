# Ollama Migration Plan

## Status: COMPLETED ✅

### Overview
Migrating AI Chat Assistant from Blackbox API to Ollama (local AI).

---

### Backend Changes - COMPLETED ✅
- [x] 1. Install ollama Python package
- [x] 2. Update server/routes.py:
  - [x] Replace `get_blackbox_client()` with `get_ollama_client()`
  - [x] Update environment variable: `BLACKBOX_API_KEY` → `OLLAMA_BASE_URL` and `OLLAMA_MODEL`
  - [x] Update base URL to Ollama API endpoint
  - [x] Update model name to llama2
  - [x] Update all error messages to reference "Ollama"
  - [x] Update all debug prints to reference "Ollama"

---

### Frontend Changes - COMPLETED ✅
- [x] 3. Update client/src/AIChatPage.jsx:
  - [x] Change "Powered by Blackbox" → "Powered by Ollama (Local AI)"

- [x] 4. Update client/src/components/AIChatWidget.jsx:
  - [x] No changes needed (no Blackbox references found)

---

### Environment Variables - COMPLETED ✅
- [x] 5. Update server/.env:
  - [x] Add `OLLAMA_BASE_URL=http://localhost:11434/v1`
  - [x] Add `OLLAMA_MODEL=llama2`

---

### Documentation - COMPLETED ✅
- [x] 6. Update TODO files:
  - [x] Mark Blackbox migration as superseded
  - [x] Document Ollama setup instructions

---

## Ollama Configuration

**Local Server:**
- Base URL: `http://localhost:11434/v1` (Ollama's OpenAI-compatible API)
- Model: `llama2`
- No API key required for local Ollama

**Setup Instructions:**
1. Install Ollama: https://ollama.com/
2. Run: `ollama pull llama2`
3. Keep Ollama running in background

---

## Files Modified

### Backend:
- `server/routes.py` - AI chat endpoints with Ollama client
- `server/venv/` - Installed ollama Python package

### Frontend:
- `client/src/AIChatPage.jsx` - Updated branding

### Environment:
- `server/.env` - Add Ollama configuration

---

## User Setup Required

To use the AI assistant, the user must:

1. **Install Ollama:**
   ```bash
   # Linux/Mac
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama and pull the model:**
   ```bash
   ollama pull llama2
   ollama serve
   ```

3. **Start the backend server:**
   ```bash
   cd server
   source venv/bin/activate
   uvicorn main:app --reload --port 3001
   ```

4. **Start the frontend:**
   ```bash
   cd client
   npm start
   ```

---

## Rollback Plan (if needed)

If Ollama doesn't work as expected:
1. Change `get_ollama_client()` back to `get_blackbox_client()`
2. Update `OLLAMA_BASE_URL` and `OLLAMA_MODEL` → `BLACKBOX_API_KEY`
3. Restore original base URL and model name
4. Revert frontend branding changes

