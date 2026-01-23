import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardGroup, Button, Modal } from 'react-bootstrap';
import profileA from '../assets/images/computer.png';
import profileB from '../assets/images/female.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { getApiUrl } from '../config';

const mentorImages = [profileA, profileB];

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/my-requests"), {
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
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'accepted':
        return <span className="badge bg-success">Accepted</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const goToMentorChat = (mentorId) => {
    navigate(`/chat_page?user=${mentorId}`);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className='fw-bold'>My Mentorship Requests</h3>
        <Link to="/mentors" className="btn btn-outline-primary">
          Find More Mentors
        </Link>
      </div>

      <div className="mentees-list">
        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <p>You haven't sent any mentorship requests yet.</p>
              <Link to="/mentors" className="btn btn-primary rounded-5">
                Find a Mentor
              </Link>
            </div>
          ) : (
            requests.map((req) => (
              <div id='mentorDesc' key={req._id} className="row mb-4">
                <div className="col-lg-3">
                  <div id="shadow">
                    <div className="mentorIMG">
                      <img 
                        className='w-100 H-100' 
                        src={mentorImages[Math.floor(Math.random() * mentorImages.length)]} 
                        alt={req.mentor_name || 'Mentor'} 
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-9 p-4">
                  <div className="container">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h2>{req.mentor_name || 'Unknown Mentor'}</h2>
                        <h5 className="mColor">{req.mentor_specialty || 'Specialty not specified'}</h5>
                        <p>{req.mentor_email}</p>
                      </div>
                      <div>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                    <p className="text-muted small">
                      Requested: {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                    
                    {req.status === 'accepted' && (
                      <button 
                        id='messagebtn' 
                        className="btn rounded-5 text-white mt-2"
                        onClick={() => goToMentorChat(req.mentor_id)}
                      >
                        <FontAwesomeIcon icon={faEnvelope} /> Message Mentor
                      </button>
                    )}
                    
                    {req.status === 'pending' && (
                      <div className="mt-2">
                        <FontAwesomeIcon icon={faClock} className="text-warning me-2" />
                        <span className="text-muted">Waiting for mentor response...</span>
                      </div>
                    )}
                    
                    {req.status === 'rejected' && (
                      <div className="mt-2">
                        <span className="text-danger">This mentorship request was declined.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;

