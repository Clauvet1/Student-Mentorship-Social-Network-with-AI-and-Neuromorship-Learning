import { useState, useEffect } from "react";
import { Link, useNavigate} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardGroup, Button } from 'react-bootstrap';
import profileA from '../assets/images/computer.png';
import profileB from '../assets/images/female.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const mentorImages = [profileA, profileB];

const MyMentees = () => {
  const [mentees, setMentees] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem("token");

      // if (!token) {
      //   navigate("/login");
      //   console.log("token missing");
      //   return;
      // }

      const response = await fetch("http://localhost:3001/api/my-mentees", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Error fetching mentees");
      } else {
        const data = await response.json();
        setMentees(data.mentees);
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="col-lg-12 col-md-8 col-sm-10 col-xs-6 p-4 mb-5">
        <h3 className='fw-bold'>My Mentees</h3>
        <div className="mentees-list">
        <div className="row">
          {mentees.map((mentee) => (
            <div id='mentorDesc' key={mentee.id} className="row">
              <div className="col-lg-3">
                <div id="shadow">
                  <div className="mentorIMG">
                    <img className='w-100 H-100' src={mentorImages[Math.floor(Math.random() * mentorImages.length)]} alt={mentee.fullName} />
                    <div className="placeholder-image"></div>
                  </div>
                </div>
              </div>
              <div className="col-lg-9 p-4">
                <div className="container">
                  <h2>{mentee.fullName}</h2>
                  <h5 className="mColor">{mentee.specialty}</h5>
                  <p>{mentee.bio}</p>
                  <Link to={`/menteeProfileView/${mentee.id}`}>
                    <button id='mView' className='btn text-white rounded-5 px-4 mt-2'>View Profile</button>
                  </Link>
                  <Link className="btn btn-secondary rounded-5 text-white ms-2 mt-2 ml-3" to={`/message/${mentee.id}`}><FontAwesomeIcon icon={faEnvelope} /> message</Link>
                </div>
              </div>
            </div>
          ))}
       </div>
       </div>
      </div>
    </div>
  );
};

export default MyMentees;