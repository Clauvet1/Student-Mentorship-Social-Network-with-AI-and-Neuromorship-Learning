import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./home";
import AboutUs from "./aboutUs";
import Testimonials from "./testimonials";
import StudentProfile from "./student pages/studentProfile";
import Login from "./Login";
import Signup from "./Signup";
import MentorProfile from "./mentor pages/mentorProfile";
import FAQ from "./FAQ";
import Resources from "./mentor pages/resources";
import Feedback from "./feedback";
import Students from "./mentor pages/mentees";
import ChatPage from "./chat_page";
import AIChatPage from "./AIChatPage";
import AIChatWidget from "./components/AIChatWidget";
import EditMProfile from "./mentor pages/EditMProfile";
import EditStudentProfile from "./student pages/EditStudentProfile";
import MentorProfileView from "./mentor pages/mentorProfileView";
import StudentProfileView from "./student pages/studentProfileView";
import MyStudents from "./mentor pages/myMentees";
import MentorSearch from "./mentor pages/mentorSearch";
import RequestMentorship from "./mentor pages/requestMentorship";
import MyRequests from "./student pages/myRequests";
import { UserProvider } from "./Usercontext";
import { jwtDecode } from "jwt-decode";

// Helper function to get user role from token
const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.userType || decoded.role || null;
  } catch (error) {
    return null;
  }
};

// Mentor-only route wrapper
const MentorRoute = ({ children }) => {
  const userRole = getUserRole();
  if (userRole !== "mentor") {
    // Redirect non-mentors to home
    return <Navigate to="/" replace />;
  }
  return children;
};

// Student-only route wrapper  
const StudentRoute = ({ children }) => {
  const userRole = getUserRole();
  if (userRole !== "student" && userRole !== "mentee") {
    // Redirect non-students to home
    return <Navigate to="/" replace />;
  }
  return children;
};

// Protected route wrapper (requires authentication)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="contents">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/mentors" element={<MentorSearch />} />
            <Route path="/request-mentorship/:mentorId" element={
              <ProtectedRoute>
                <StudentRoute>
                  <RequestMentorship />
                </StudentRoute>
              </ProtectedRoute>
            } />
            <Route path="/my-students" element={
              <ProtectedRoute>
                <MentorRoute>
                  <MyStudents />
                </MentorRoute>
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute>
                <StudentRoute>
                  <MyRequests />
                </StudentRoute>
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/studentProfile" element={
              <ProtectedRoute>
                <StudentRoute>
                  <StudentProfile />
                </StudentRoute>
              </ProtectedRoute>
            } />
            <Route path="/studentProfileView/:id" element={<StudentProfileView />} />
            <Route path="/mentorProfile" element={
              <ProtectedRoute>
                <MentorRoute>
                  <MentorProfile />
                </MentorRoute>
              </ProtectedRoute>
            } />
            <Route path="/mentorProfileView/:id" element={<MentorProfileView />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/students" element={<Students />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/chat_page" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-chat" element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            } />
            <Route path="/editMProfile" element={
              <ProtectedRoute>
                <MentorRoute>
                  <EditMProfile />
                </MentorRoute>
              </ProtectedRoute>
            } />
            <Route path="/editStudentProfile" element={
              <ProtectedRoute>
                <StudentRoute>
                  <EditStudentProfile />
                </StudentRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        <Footer />
        {/* Floating AI Chat Widget */}
        <AIChatWidget />
      </Router>
    </UserProvider>
  );
}

export default App;

