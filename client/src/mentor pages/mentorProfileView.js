import { useState, useEffect, useContext } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage, faLocationDot, faMessage, faPhone, faVoicemail, faUserPlus} from '@fortawesome/free-solid-svg-icons'
import amIMG from '../assets/images/female.png';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { UserContext } from "../Usercontext";
import { getApiUrl } from "../config";

const MentorProfileView = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState('');
    const { isLoggedIn } = useContext(UserContext);
    const navigate = useNavigate();
    const {id: mentorId} = useParams();

    useEffect(() => {
        fetchProfileData();
    }, [mentorId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(getApiUrl(`/api/mentor-profile-view/${mentorId}`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            
            if (response.ok) {
                setUserData(data);
            } else {
                setError(data.detail || "Failed to load mentor profile");
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError("Failed to connect to server. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestMentorship = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem("token");
            setRequestStatus('sending');
            
            const response = await fetch(getApiUrl(`/api/request-mentorship/${mentorId}`), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            
            if (response.ok) {
                setRequestStatus('success');
                alert("Mentorship request sent successfully! You will be notified when the mentor responds.");
            } else {
                setRequestStatus('error');
                alert(data.detail || "Failed to send mentorship request");
            }
        } catch (err) {
            setRequestStatus('error');
            console.error("Error sending request:", err);
            alert("Failed to connect to server");
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading mentor profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="container mt-5 text-center">
                <p className="text-muted">Mentor not found</p>
                <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="col-lg-8 col-md-8 col-sm-10 col-xs-6 p-4 mb-5 mx-auto">
                <div className="col-lg-4 col-md-8 col-sm-8 col-xs-4">
                    <div className="amIMG w-50">
                        <img className='w-100' src={amIMG} alt="profileImage" />
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-lg-6">
                        <h3 className='fw-bold'>{userData.fullName || userData.name}</h3>
                        <h6>
                            {userData.role === 'mentor' ? 'Mentor' : 'Professional'} at {userData.school || 'Not specified'}
                            <br />
                            <span>{userData.department || userData.specialty}</span>
                        </h6>
                        <div className='mt-4'>
                            {userData.location && (
                                <div className="line1">
                                    <FontAwesomeIcon className='icon-small' icon={faLocationDot} />
                                    <p>{userData.location}</p>
                                </div>
                            )}
                            {userData.phone && (
                                <div className="line1">
                                    <FontAwesomeIcon className='icon-small' icon={faPhone} />
                                    <p>{userData.phone}</p>
                                </div>
                            )}
                            {userData.language && (
                                <div className="line1">
                                    <FontAwesomeIcon className='icon-small' icon={faLanguage} />
                                    <p>{userData.language}</p>
                                </div>
                            )}
                            {userData.email && (
                                <div className="line1">
                                    <FontAwesomeIcon className='icon-small' icon={faVoicemail} />
                                    <p>{userData.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <h5>Skills</h5>
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="skillsBox">
                                    <p>{userData.skills || 'No skills listed'}</p>
                                </div>
                            </div>
                        </div>
                        {userData.specialty && (
                            <div className="mt-3">
                                <h5>Specialty</h5>
                                <p className="text-muted">{userData.specialty}</p>
                            </div>
                        )}
                    </div>
                </div>
                <hr />
                <div className="AboutM mt-5">
                    <h3 className='fw-bold'>Bio</h3>
                    <p>{userData.bio || 'No bio available'}</p>
                </div>
                <div className="messageMentor">
                    <div className="row">
                        <div className="col-lg-2">
                            <FontAwesomeIcon className='icon-large w-100 mt-3 mb-2' icon={faMessage} />
                        </div>
                        <div className='col-lg-6'>
                            <h4>Message mentor</h4>
                            <p>You can communicate with mentor from here</p>
                        </div>
                        <div className="col-lg-4">
                            <Link id='messagebtn' className='btn rounded-5 text-white mt-3 ms-4' to={`/chat_page?user=${mentorId}`}>
                                Message Mentor
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Request Mentorship Button - Only show for logged-in students/mentees */}
                <div className="requestMentorship mt-4">
                    <div className="row">
                        <div className="col-lg-2">
                            <FontAwesomeIcon className='icon-large w-100 mt-3 mb-2' icon={faUserPlus} />
                        </div>
                        <div className='col-lg-6'>
                            <h4>Request Mentorship</h4>
                            <p>Send a mentorship request to this mentor</p>
                        </div>
                        <div className="col-lg-4">
                            <button 
                                id='requestbtn' 
                                className='btn bg-black text-white rounded-5 mt-3 ms-4 px-4'
                                onClick={handleRequestMentorship}
                                disabled={requestStatus === 'sending'}
                            >
                                {requestStatus === 'sending' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Sending...
                                    </>
                                ) : (
                                    'Request Mentorship'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <Link to="/mentors" className="btn btn-outline-secondary rounded-5">
                        ← Back to Mentors
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MentorProfileView;

