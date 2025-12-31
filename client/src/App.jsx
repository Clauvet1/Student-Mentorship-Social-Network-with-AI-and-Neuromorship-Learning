import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./home";
import AboutUs from "./aboutUs";
import Testimonials from "./testimonials";
import Mentors from "./mentee pages/mentors";
import MenteeProfile from "./mentee pages/menteeProfile";
import Login from "./Login";
import Signup from "./Signup";
import MentorProfile from "./mentor pages/mentorProfile";
import FAQ from "./FAQ";
import Resources from "./mentor pages/resources";
import Feedback from "./feedback";
import Mentees from "./mentor pages/mentees";
import ChatPage from "./chat_page";
import EditMProfile from "./mentor pages/EditMProfile";
import EditMenteeProfile from "./mentee pages/EditMenteeProfile";
import MentorProfileView from "./mentor pages/mentorProfileView";
import MenteeProfileView from "./mentee pages/menteeProfileView";
import MyMentors from "./mentee pages/myMentors";
import MyMentees from "./mentor pages/myMentees";
import { UserProvider } from "./Usercontext";

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
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/my-mentors" element={<MyMentors />} />
            <Route path="/my-mentees" element={<MyMentees />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/menteeProfile" element={<MenteeProfile />} />
            <Route
              path="/menteeProfileView/:id"
              element={<MenteeProfileView />}
            />
            <Route path="/mentorProfile" element={<MentorProfile />} />
            <Route
              path="/mentorProfileView/:id"
              element={<MentorProfileView />}
            />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/mentees" element={<Mentees />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/chat_page" element={<ChatPage />} />
            <Route path="/editMProfile" element={<EditMProfile />} />
            <Route path="/editMenteeProfile" element={<EditMenteeProfile />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </UserProvider>
  );
}

export default App;
