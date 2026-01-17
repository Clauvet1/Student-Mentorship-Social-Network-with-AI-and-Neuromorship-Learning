import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import profileA from '../assets/images/computer.png';
import profileB from '../assets/images/female.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const mentorImages = [profileA, profileB];

const MyMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
    fetchRequests();
  }, []);

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/my-mentors", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
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

  const goToChat = (mentorId) => {
    navigate(`/chat_page?user=${mentorId}`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className='fw-bold'>My Mentors</h3>
        <div className="text-muted">
          {pendingCount > 0 ? (
            <span className="badge bg-warning text-dark">{pendingCount} request{pendingCount > 1 ? 's' : ''} pending</span>
          ) : (
            <span className="badge bg-success">All requests processed</span>
          )}
        </div>
      </div>

      <div className="mentees-list">
        <div className="row">
          {mentors.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <p>No mentors yet.</p>
              <Link to="/mentors" className="btn btn-primary">Browse Mentors</Link>
              <p className="mt-3 small">Request mentorship from a mentor to connect with them.</p>
            </div>
          ) : (
            mentors.map((mentor) => (
              <div id='mentorDesc' key={mentor._id} className="row mb-4">
                <div className="col-lg-3">
                  <div id="shadow">
                    <div className="mentorIMG">
                      <img 
                        className='w-100 H-100' 
                        src={mentorImages[Math.floor(Math.random() * mentorImages.length)]} 
                        alt={mentor.name} 
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-9 p-4">
                  <div className="container">
                    <h2>{mentor.name}</h2>
                    <h5 className="mColor">{mentor.specialty || 'No specialty'}</h5>
                    <p>{mentor.email}</p>
                    <Link to={`/mentorProfileView/${mentor._id}`}>
                      <button id='mView' className='btn text-white rounded-5 px-4 mt-2'>View Profile</button>
                    </Link>
                    <button 
                      id='messagebtn' 
                      className="btn rounded-5 text-white mt-2 ms-2"
                      onClick={() => goToChat(mentor._id)}
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
    </div>
  );
};

export default MyMentors;

