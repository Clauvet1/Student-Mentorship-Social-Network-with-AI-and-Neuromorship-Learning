import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardGroup, Button, Modal } from 'react-bootstrap';
import profileA from '../assets/images/computer.png';
import profileB from '../assets/images/female.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const mentorImages = [profileA, profileB];

const MyMentees = () => {
  const [mentees, setMentees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentees();
    fetchRequests();
  }, []);

  const fetchMentees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/my-mentees", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMentees(data);
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/my-requests", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/accept-request/${requestId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchMentees();
        fetchRequests();
        setShowRequests(false);
        alert("Request accepted!");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/reject-request/${requestId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const goToChat = (userId) => {
    navigate(`/chat_page?user=${userId}`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className='fw-bold'>My Mentees</h3>
        <button 
          className="btn btn-primary position-relative"
          onClick={() => setShowRequests(true)}
        >
          <i className="fas fa-bell me-2"></i>
          Requests
          {pendingCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      <div className="mentees-list">
        <div className="row">
          {mentees.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <p>No mentees yet. Accept mentorship requests to see your mentees here.</p>
            </div>
          ) : (
            mentees.map((mentee) => (
              <div id='mentorDesc' key={mentee._id} className="row mb-4">
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
                    <Link to={`/menteeProfileView/${mentee._id}`}>
                      <button id='mView' className='btn text-white rounded-5 px-4 mt-2'>View Profile</button>
                    </Link>
                    <button 
                      id='messagebtn' 
                      className="btn rounded-5 text-white mt-2 ms-2"
                      onClick={() => goToChat(mentee._id)}
                    >
                      <FontAwesomeIcon icon={faEnvelope} /> Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Requests Modal */}
      <Modal show={showRequests} onHide={() => setShowRequests(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Mentorship Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requests.length === 0 ? (
            <p className="text-center text-muted">No pending requests</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{req.mentee_name}</h6>
                    <small className="text-muted">{req.mentee_email}</small>
                    <br />
                    <small className="text-muted">Requested: {new Date(req.created_at).toLocaleDateString()}</small>
                  </div>
                  <div>
                    {req.status === 'pending' ? (
                      <>
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => acceptRequest(req._id)}
                        >
                          <FontAwesomeIcon icon={faCheck} /> Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => rejectRequest(req._id)}
                        >
                          <FontAwesomeIcon icon={faTimes} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${req.status === 'accepted' ? 'bg-success' : 'bg-danger'}`}>
                        {req.status}
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

