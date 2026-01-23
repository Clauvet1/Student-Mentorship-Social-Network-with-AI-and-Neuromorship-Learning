# Blackbox API Migration - TODO List

## Status: In Progress 🔄

### Overview
Migrating AI Chat Assistant from DeepSeek to Blackbox API.

---

### Backend Changes - COMPLETED ✅
- [x] 1. Update server/routes.py:
  - [x] Rename `get_deepseek_client()` → `get_blackbox_client()`
  - [x] Update environment variable: `DEEPSEEK_API_KEY` → `BLACKBOX_API_KEY`
  - [x] Update base URL to Blackbox API endpoint
  - [x] Update model name to Blackbox model
  - [x] Update all error messages to reference "Blackbox"
  - [x] Update all debug prints to reference "Blackbox"

---

### Frontend Changes - COMPLETED ✅
- [x] 2. Update client/src/AIChatPage.jsx:
  - [x] Change "Powered by Deepseek" → "Powered by Blackbox"

- [ ] 3. Update client/src/components/AIChatWidget.jsx:
  - [ ] Add Blackbox branding if applicable (not needed - no Deepseek references found)

---

### Environment Variables - PENDING ⏳
- [ ] 4. Update server/.env:
  - [ ] Change `DEEPSEEK_API_KEY` to `BLACKBOX_API_KEY`
  - [ ] Add your Blackbox API key

---

### Documentation - COMPLETED ✅
- [x] 5. Update TODO files:
  - [x] Mark Deepseek migration as superseded
  - [x] Document Blackbox API details

---

### Testing - PENDING ⏳
- [ ] 6. Test the AI chat assistant:
  - [ ] Verify API connection
  - [ ] Test chat responses
  - [ ] Verify error handling

---

## Blackbox API Configuration

**API Details (to be confirmed):**
- Base URL: `https://api.blackbox.ai/v1` (or provider's endpoint)
- Model: `blackbox-chat` (or specific model name)
- API Key: `BLACKBOX_API_KEY`

**If you have the exact Blackbox API details, please update:**
1. `server/routes.py` - Update `base_url` and `model` parameters
2. `server/.env` - Add your `BLACKBOX_API_KEY`

---

## Files Modified

### Backend:
- `server/routes.py` - AI chat endpoints with Blackbox client

### Frontend:
- `client/src/AIChatPage.jsx` - Updated branding
- `client/src/components/AIChatWidget.jsx` - Branding updates

### Environment:
- `server/.env` - API key variable name

---

## Rollback Plan (if needed)

If Blackbox API doesn't work as expected:
1. Change `get_blackbox_client()` back to `get_deepseek_client()`
2. Update `BLACKBOX_API_KEY` → `DEEPSEEK_API_KEY`
3. Restore original base URL and model name
4. Revert frontend branding changes

---

## Next Steps

1. Add your Blackbox API key to `server/.env` file
2. Verify Blackbox API endpoint and model name with your provider
3. Restart the server
4. Test the AI chat assistant
5. Monitor for any API errors and adjust configuration as needed

