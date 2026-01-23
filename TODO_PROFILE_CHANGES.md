# TODO: User Profile Editing & Terminology Update - PROGRESS

## Phase 1: Add Missing Backend Endpoints (server/routes.py) ✅ COMPLETED
- [x] GET /api/student-profile - Get logged-in student's profile
- [x] GET /api/mentor-profile - Get logged-in mentor's profile
- [x] PUT /api/editStudentProfile - Update student profile
- [x] PUT /api/editMentorProfile - Update mentor profile
- [x] GET /api/student-profile-view/{id} - View any student by ID
- [x] GET /api/my-students - New endpoint (with backwards compatibility for my-mentees)

## Phase 2: Rename Files & Create New Files (client/src) ✅ COMPLETED
### New Files Created
- [x] student pages/studentProfile.js
- [x] student pages/EditStudentProfile.js
- [x] student pages/studentProfileView.js

### Updated App.jsx ✅ COMPLETED
- [x] Updated imports to use new paths
- [x] Updated route paths (/studentProfile, /editStudentProfile, /studentProfileView, /my-students)

### Updated Login.js ✅ COMPLETED
- [x] Updated navigate path from /menteeProfile to /studentProfile

### Updated Signup.js ✅ COMPLETED
- [x] Changed "Mentee" button text to "Student"
- [x] Updated role from "mentee" to "student"

### Updated Client Files (endpoint updates) ✅ COMPLETED
- [x] menteeProfile.js - Updated to use /api/student-profile
- [x] EditMenteeProfile.js - Updated to use /api/editStudentProfile
- [x] menteeProfileView.js - Updated to use /api/student-profile-view
- [x] mentorProfile.js - Updated to use /api/mentor-profile
- [x] EditMProfile.js - Updated to use /api/editMentorProfile (PUT method)

## Phase 3: Update Server Terminology ✅ COMPLETED
### Updated server/routes.py
- [x] Changed mentee_id to student_id in mentorship data
- [x] Updated comments mentioning "mentee" to "student"
- [x] Added backwards compatibility for /my-mentees endpoint

### server/models.py - PENDING (if needed)
- [ ] Consider changing default role from "mentee" to "student"

## Still Needed to Complete:
1. Delete old files (mentee pages/menteeProfile.js, EditMenteeProfile.js, menteeProfileView.js)
2. Update Navbar.js to link to new profile routes
3. Update FAQ.js, home.js, testimonials.js with "student" terminology
4. Update index.css comments
5. Update chat_page.jsx role checks

