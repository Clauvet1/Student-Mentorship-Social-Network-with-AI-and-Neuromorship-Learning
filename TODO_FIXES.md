# API URL Fixes - TODO List

## ✅ Files Fixed (Hardcoded URLs → Centralized getApiUrl())

### High Priority - Authentication & Profile Pages ✅
- [x] `client/src/Login.js` - Fixed `/api/login` URL
- [x] `client/src/Signup.js` - Fixed `/api/signup` URL
- [x] `client/src/mentor pages/mentorProfile.js` - Fixed `/api/mentor-profile` URL
- [x] `client/src/student pages/studentProfile.js` - Fixed `/api/student-profile` and `/api/add-mentor` URLs
- [x] `client/src/student pages/myRequests.js` - Fixed `/api/my-requests` URL
- [x] `client/src/student pages/EditStudentProfile.js` - Fixed `/api/editStudentProfile` URL
- [x] `client/src/mentor pages/EditMProfile.js` - Fixed `/api/editMentorProfile` URL

### Medium Priority - Navigation & Components ✅
- [x] `client/src/components/Navbar.js` - Fixed `/api/my-requests` URL

### Cleanup - Remove Duplicate API Functions ✅
- [x] `client/src/mentor pages/mentorSearch.js` - Removed local `getApiUrlLocal`, using imported `getApiUrl`
- [x] `client/src/mentor pages/mentorProfileView.js` - Removed local `getApiUrlLocal`, using imported `getApiUrl`
- [x] `client/src/mentor pages/requestMentorship.js` - Removed local `getApiUrlLocal`, using imported `getApiUrl`

## Summary of Changes:
1. All hardcoded URLs (`http://localhost:3001`) replaced with `getApiUrl()` function
2. Duplicate local API configuration code removed
3. All files now consistently use the centralized `config.js` for API URL management
4. The API URL can now be changed in one place (`config.js`) without breaking any pages

## Expected Result:
✅ All mentorship and student pages should now load data properly using the centralized API configuration.

