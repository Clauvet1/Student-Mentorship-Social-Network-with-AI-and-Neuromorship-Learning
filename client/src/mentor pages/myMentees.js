import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardGroup, Button, Modal } from 'react-bootstrap';
import profileA from '../assets/images/computer.png';
import profileB from '../assets/images/female.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheck, faTimes, faUser, faGraduationCap, faSchool } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../Usercontext";
import { getApiUrl } from "../config";

const mentorImages = [profileA, profileB];

const MyMentees = () => {
  const { isLoggedIn } = useContext(UserContext);
  const [mentees, setMentees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch user data and then get mentees
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError('Please log in to access this page');
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.userType || decoded.role;
      console.log("Token decoded:", decoded);
      console.log("User role:", userRole);
      setUserInfo(decoded);
      
      if (userRole !== 'mentor') {
        setAuthError('Only mentors can access this page');
        setLoading(false);
        return;
      }
      
      // Get user ID from token or fetch from API
      const userId = decoded.userId || null;
      loadMentorData(token, userId);
    } catch (error) {
      console.error("Error decoding token:", error);
      setAuthError('Invalid authentication token');
      setLoading(false);
    }
  }, []);

  const loadMentorData = async (token, userId) => {
    try {
      // If userId is not in token, fetch from /api/me
      if (!userId) {
        console.log("Fetching user ID from /api/me");
        const userResponse = await fetch(getApiUrl("/api/me"), {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("User data from /api/me:", userData);
          userId = userData._id;
        }
      } else {
        console.log("User ID from token:", userId);
      }
      
      if (!userId) {
        setDebugInfo("Could not get user ID");
        setLoading(false);
        return;
      }
      
      // Now fetch mentees and requests
      console.log("=== FETCHING MENTORSHIPS ===");
      console.log("Current user DB ID:", userId);
      
      await Promise.all([
        fetchMentees(token, userId),
        fetchRequests(token)
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading mentor data:", error);
      setDebugInfo(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchMentees = async (token, userId) => {
    try {
      console.log("Fetching from:", getApiUrl("/api/active-mentorships"));
      
      const response = await fetch(getApiUrl("/api/active-mentorships"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Active mentorships data:", data);
        console.log("Data length:", data.length);
        
        // Log each mentorship for debugging
        if (data.length > 0) {
          data.forEach((ms, idx) => {
            console.log(`Mentorship ${idx}:`, ms);
          });
        }
        
        // Filter to only show students/mentees
        const students = data.filter(p => p.role === 'student' || p.role === 'mentee');
        console.log("Filtered students:", students);
        setMentees(students);
        setDebugInfo(`Found ${students.length} active mentees`);
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setDebugInfo(`Error fetching: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
      setDebugInfo(`Network error: ${error.message}`);
    }
  };

  const fetchRequests = async (token) => {
    try {
      console.log("Fetching my-requests from:", getApiUrl("/api/my-requests"));
      
      const response = await fetch(getApiUrl("/api/my-requests"), {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Requests response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Requests data:", data);
        console.log("Number of requests:", data.length);
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl(`/api/accept-request/${requestId}`), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        // Reload all data
        const userId = userInfo?.userId || null;
        await loadMentorData(token, userId);
        setShowRequests(false);
        alert("Request accepted! Student is now your mentee.");
      } else {
        alert(data.detail || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl(`/api/reject-request/${requestId}`), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        // Reload requests only
        await fetchRequests(token);
        if (requests.filter(r => r.status === 'pending').length <= 1) {
          setShowRequests(false);
        }
      } else {
        alert(data.detail || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    }
  };

  const goToChat = (userId) => {
    navigate(`/chat_page?user=${userId}`);
  };

  const getMenteeId = (mentee) => mentee._id || mentee.id;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mt-5">
      {authError && (
        <div className="alert alert-danger" role="alert">
          {authError}
        </div>
      )}
      
      {!authError && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className='fw-bold'>My Mentees</h3>
          <button 
            className="btn btn-primary position-relative"
            onClick={() => setShowRequests(true)}
          >
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            Requests
            {pendingCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="alert alert-info" role="alert">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}

      {/* User Info Debug */}
      {userInfo && (
        <div className="alert alert-secondary" role="alert">
          <strong>Current User:</strong> {userInfo.sub} ({userInfo.role})
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="mentees-list">
          <div className="row">
            {mentees.length === 0 ? (
              <div className="col-12 text-center text-muted py-5">
                <p>No mentees yet.</p>
                <p className="small">
                  1. Check if students have sent you mentorship requests (click "Requests" button)<br/>
                  2. Accept a request to add a mentee
                </p>
              </div>
            ) : (
              mentees.map((mentee) => {
                const menteeId = getMenteeId(mentee);
                return (
                  <div id='mentorDesc' key={menteeId} className="row mb-4">
                    <div className="col-lg-3">
                      <div id="shadow">
                        <div className="mentorIMG">
                          <img 
                            className='w-100 H-100' 
                            src={mentorImages[Math.floor(Math.random() * mentorImages.length)]} 
                            alt={mentee.name} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-9 p-4">
                      <div className="container">
                        <h2>{mentee.name}</h2>
                        <h5 className="mColor">{mentee.specialty || 'No specialty'}</h5>
                        <p>{mentee.email}</p>
                        <Link to={`/studentProfileView/${menteeId}`}>
                          <button id='mView' className='btn text-white rounded-5 px-4 mt-2'>View Profile</button>
                        </Link>
                        <button 
                          id='messagebtn' 
                          className="btn rounded-5 text-white mt-2 ms-2"
                          onClick={() => goToChat(menteeId)}
                        >
                          <FontAwesomeIcon icon={faEnvelope} /> Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <Modal show={showRequests} onHide={() => setShowRequests(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Mentorship Requests
            {pendingCount > 0 && (
              <span className="badge bg-danger ms-2">{pendingCount}</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requests.length === 0 ? (
            <p className="text-center text-muted py-4">No mentorship requests</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-muted" />
                      <h6 className="mb-0 me-2">{req.student_name || 'Unknown Student'}</h6>
                      <span className={`badge ${
                        req.status === 'pending' ? 'bg-warning text-dark' :
                        req.status === 'accepted' ? 'bg-success' : 'bg-danger'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="text-muted small">
                      <p className="mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        {req.student_email || 'No email'}
                      </p>
                      {req.created_at && (
                        <p className="mb-1">
                          <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                          Requested: {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ms-3">
                    {req.status === 'pending' ? (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => acceptRequest(req._id)}
                          title="Accept Request"
                        >
                          <FontAwesomeIcon icon={faCheck} /> Accept
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => rejectRequest(req._id)}
                          title="Reject Request"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ) : (
                      <span className={`badge ${req.status === 'accepted' ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                        {req.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MyMentees;

