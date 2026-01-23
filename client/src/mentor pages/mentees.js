import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import profileA from '../assets/images/consultancy.png';
import profileB from '../assets/images/mentorship.png';
import { getApiUrl } from '../config';

const menteeImages = [profileA, profileB];

const Mentees = () => {
  const [studentData, setStudentData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.log("Fetching students from:", getApiUrl("/api/users"));
        
        const response = await fetch(getApiUrl("/api/users"), {
          headers: headers,
        });
        
        if (!response.ok) {
          throw new Error('Unable to fetch students: ' + response.status);
        }
        const data = await response.json();
        
        console.log("API Response:", data);
        console.log("First student sample:", data[0]);
        
        // Filter to only show students/mentees
        const students = data
          .filter(user => user.role === 'student' || user.role === 'mentee')
          .map(user => {
            console.log("Student ID:", user._id, "Type:", typeof user._id);
            return {
              ...user,
              // Use _id which is returned as string from the API
              studentId: user._id
            };
          });
        
        console.log("Filtered students:", students);
        setStudentData(students);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading students...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="main">
      <div className="mentees-list">
        <div className="row">
          {studentData.map((student) => (
            <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={student.studentId || Math.random()}>
              <div className="mentee-card">
                <div className="mentee-image">
                  <img className="w-50 h-150" src={menteeImages[Math.floor(Math.random() * menteeImages.length)]} alt={student.fullName || student.name} />
                </div>
                <div className="mentee-content">
                  <h4 className="fw-bold mb-3">{student.fullName || student.name}</h4>
                  <h5 className="mb-3 mColor">{student.specialty || 'No specialty'}</h5>
                  <p className="mb-3">{student.bio || 'No bio available'}</p>
                  <Link to={`/studentProfileView/${student.studentId}`}>
                    <button id='mView' className='btn text-white rounded-5 px-4 mt-2'>View Profile</button>
                  </Link>
                  <Link className="btn btn-secondary rounded-5 text-white ms-2 mt-2 ml-3" to={`/chat_page?user=${student.studentId}`}>
                    <FontAwesomeIcon icon={faEnvelope} /> Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {studentData.length === 0 && (
          <div className="text-center p-4">
            <p>No students found.</p>
            <p>Check browser console for API response details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentees;

