import { useState, useEffect } from "react";
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage, faLocationDot, faPhone, faVoicemail, faEdit, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import amIMG from '../assets/images/consultancy.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Alert } from 'react-bootstrap';

const MenteeProfile = () => {
    const [userData, setUserData] = useState("");
    const [matchingMentors, setMatchingMentors] = useState([]);
    const [showModal, setShowModal] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const history = useHistory();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem("token");

            // if (!token) {
            //     history.push("/login");
            //     console.log("token missing");
            //     return;
            // }

            const response = await fetch("http://localhost:3001/api/mentee-profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log("Response error");
            } else {
                const data = await response.json();
                setUserData(data.userData);
                setMatchingMentors(data.matchingMentors);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const handleCloseModal = () => setShowModal(false);

    const addMentor = async (mentorId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3001/api/add-mentor/${mentorId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log("Error adding mentor");
            } else {
                console.log("Mentor added successfully");
                // Refresh the mentor list
                fetchProfileData();
                // Show the success message
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error adding mentor:", error);
        }
    };

    const handleCloseAlert = () => setShowAlert(false);

    return (
        <div className="container mt-5">
            <div className="col-lg-8 col-md-8 col-sm-10 col-xs-6 p-4 mb-5">
                <div className="col-lg-4 col-md-8 col-sm-8 col-xs-4">
                    <div className="amIMG w-50">
                        <img className='w-100' src={amIMG} alt="profileImage" />
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-lg-6">
                        <h3 className='fw-bold'>{userData.fullName}</h3>
                        <h6>Student at {userData.school} <br /><span>{userData.department}</span></h6>
                        <div className='mt-4'>
                            <div className="line1">
                                <FontAwesomeIcon className='icon-small' icon={faLocationDot} />
                                <p>{userData.location}</p>
                            </div>
                            <div className="line1">
                                <FontAwesomeIcon className='icon-small' icon={faPhone} />
                                <p>({userData.phone})</p>
                            </div>
                            <div className="line1">
                                <FontAwesomeIcon className='icon-small' icon={faLanguage} />
                                <p>{userData.language}</p>
                            </div>
                            <div className="line1">
                                <FontAwesomeIcon className='icon-small' icon={faVoicemail} />
                                <p>{userData.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <h5>Skills</h5>
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="skillsBox">
                                    <p>{userData?.skills}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="AboutM mt-5">
                    <h3 className='fw-bold'>Bio</h3>
                    <p>{userData.bio}</p>
                </div>
                <div className="messageMentor">
                    <div className="row">
                        <div className="col-lg-2">
                            <FontAwesomeIcon className='icon-large w-100 mt-3 mb-2' icon={faEdit} />
                        </div>
                        <div className='col-lg-6'>
                            <h4>Edit Profile</h4>
                            <p>You can edit your profile here</p>
                        </div>
                        <div className="col-lg-4">
                            <Link id='messagebtn' className='btn rounded-5 text-white mt-3 ms-4' to='/editMenteeprofile'>Edit Profile</Link>
                        </div>
                    </div>
                </div>
                <div className="messageMentor">
                    <div className="row">
                        <div className="col-lg-2">
                            <FontAwesomeIcon className='icon-large w-100 mt-3 mb-2' icon={faPeopleArrows} />
                        </div>
                        <div className='col-lg-6'>
                            <h4>View Mentors</h4>
                            <p>Yo can all your mentors here</p>
                        </div>
                        <div className="col-lg-4">
                            <Link id='messagebtn' className='btn rounded-5 text-white mt-3 ms-4' to='/my-mentors'>My Mentors</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for displaying recommended mentors */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Recommended Mentors</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {matchingMentors.length > 0 ? (
                        <ul className="list-group">
                            {matchingMentors.map(mentor => (
                                <li key={mentor.id} className="list-group-item">
                                    <h5>{mentor.fullName}</h5>
                                    <p><strong>Specialty:</strong> {mentor.specialty}</p>
                                    <p><strong>Email:</strong> {mentor.email}</p>
                                    <p><strong>Bio:</strong> {mentor.bio}</p>
                                    <button id='messagebtn' className="btn rounded-5 text-white mt-3 ms-4" onClick={() => addMentor(mentor.id)}>Add Mentor</button>
                                    {showAlert && (
                                        <Modal show={showAlert} onHide={handleCloseAlert}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Mentor Added</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <p>Mentor added successfully!</p>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <button id='messagebtn' className="btn rounded-5 text-white mt-3 ms-4" onClick={handleCloseAlert}>Close</button>
                                            </Modal.Footer>
                                        </Modal>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No mentors found with the same specialty.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-danger rounded-5 text-black  mt-3 ms-4" onClick={handleCloseModal}>Close</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MenteeProfile;