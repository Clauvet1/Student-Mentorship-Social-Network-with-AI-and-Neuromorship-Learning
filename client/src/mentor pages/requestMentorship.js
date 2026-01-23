import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../Usercontext';
import { jwtDecode } from "jwt-decode";
import { getApiUrl } from '../config';

const RequestMentorship = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);
  
  const [mentor, setMentor] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Check if user is a student (not a mentor)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.userType || decoded.role;
        if (userRole === 'mentor') {
          setAuthError('Mentors cannot request mentorship. Please use your mentor account.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    
    fetchMentor();
  }, [mentorId, isLoggedIn, navigate]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${mentorId}`));
      const data = await response.json();
      
      if (response.ok) {
        setMentor(data);
      } else {
        setError(data.detail || 'Failed to fetch mentor details');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching mentor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/request-mentorship/${mentorId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mentorship request sent successfully!');
        setTimeout(() => {
          navigate('/my-requests');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to send mentorship request');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error sending request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          {authError}
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="fw-bold mb-4">Request Mentorship</h2>
              
              {/* Mentor Info */}
              {mentor && (
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                  <div className="me-3">
                    <img
                      src="https://via.placeholder.com/80"
                      alt={mentor.name}
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h5 className="mb-1">{mentor.name}</h5>
                    <p className="text-muted mb-0">{mentor.specialty}</p>
                    <p className="text-muted small mb-0">{mentor.school}</p>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              {/* Request Form */}
              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label fw-bold">
                      Why do you want this mentor?
                    </label>
                    <textarea
                      id="message"
                      className="form-control"
                      rows="4"
                      placeholder="Tell the mentor about yourself and why you'd like to be their mentee..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn bg-black text-white rounded-5 px-4"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Request'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-5"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestMentorship;

