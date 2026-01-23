import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/sm1.png";
import { UserContext } from "../Usercontext";
import { jwtDecode } from "jwt-decode";
import profile from "../assets/images/consultancy.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightToBracket, faBell, faRobot } from "@fortawesome/free-solid-svg-icons";
import { getApiUrl } from "../config";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mentors?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fetch pending requests count for mentors
  const fetchPendingRequests = async () => {
    if (userType !== 'mentor') return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/my-requests"), {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pending = data.filter(r => r.status === 'pending').length;
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      } else {
        try {
          const decoded = jwtDecode(token);
          // Extract claims from the decoded token directly
          setUserType(decoded.userType || decoded.role || "");
          setUserName(decoded.userName || decoded.name || "");
          setEmail(decoded.email || decoded.sub || "");
        } catch (error) {
          console.error("Error decoding token:", error);
          // Token might be malformed, logout user
          handleLogout();
        }
      }
    }
  }, [navigate, isLoggedIn]);

  useEffect(() => {
    if (userType === 'mentor') {
      fetchPendingRequests();
    }
  }, [userType]);

  return (
    <div className="bar shadow-lg rounded-5 p-1 fw-bold">
      <nav className="navbar navbar-expand-xxl  navbar-white bg-white rounded-5" aria-label="Seventh navbar example">
        <div className="container-fluid">
          <Link className="navbar-brand mx-3" id="IMG-logo" to="/">
            <img className="w-100" src={logo} alt="Logo" />
          </Link>
          <Link className="navbar-brand" to="/">SMentorship</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExampleXxl" aria-controls="navbarsExampleXxl" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsExampleXxl">
            <ul className="navbar-nav me-auto ms-5 mb-2 mb-sm-0">
              {isLoggedIn ? (
                userType === 'mentor' ? (
                  <li className="nav-item ms-5">
                    <Link className="nav-link" to="/my-students">
                      <span className="position-relative">
                        My Students
                        {pendingRequests > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {pendingRequests}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ) : (
                  <li className="nav-item dropdown ms-5">
                    <Link className="nav-link dropdown-toggle ms-5" to="" data-bs-toggle="dropdown" aria-expanded="false"> Browse</Link>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/mentors">  Mentors</Link> </li>
                      <li><Link className="dropdown-item" to="/students">  Students</Link> </li>
                    </ul>
                  </li>
                )
              ) : (
                <li className="mx-5"></li>
              )}
              <li>
                <form role="search" className="pe-5 me-2" onSubmit={handleSearch}>
                  <input
                    className="form-control rounded-5 me-5 pe-5"
                    id="search"
                    type="search"
                    placeholder="Search mentors..."
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </li>
              <li className="nav-item ms-5 ps-5">
                <Link to="/testimonials" className="nav-link active" id="success" aria-current="page"> Success Stories </Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" to="/"> More</Link>
                <ul className="dropdown-menu">
                  <li><Link to="/aboutUs" className="dropdown-item"> AboutUs </Link></li>
                  <li><Link className="dropdown-item" to="/faq"> FAQs </Link></li>
                  <li><Link className="dropdown-item" to="/feedBack"> Feed-Back </Link></li>
                  {isLoggedIn && (
                    <li>
                      <Link className="dropdown-item" to="/ai-chat">
                        <FontAwesomeIcon icon={faRobot} className="me-2" />
                        AI Chat Assistant
                      </Link>
                    </li>
                  )}
                </ul>
              </li>

              {isLoggedIn ? (
                <>
                  <li id="navMore">
                    <div className="profileIMG">
                      <img className='w-100' src={profile} alt="profileImage" />
                    </div>
                  </li>
                  <li className="nav-item dropdown">
                    <Link className="row nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" to="/"> 
                      {userName} 
                    </Link>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item " id="profile-name" to="/"> 
                          {userName} <br/> <span>{email}</span> 
                        </Link>
                      </li>
                      {userType === 'student' || userType === 'mentee' ? (
                        <>
                          <li><Link className="dropdown-item" to="/studentProfile">Profile</Link></li>
                          <li><Link className="dropdown-item" to="/my-requests">My Requests</Link></li>
                        </>
                      ) : (
                        <>
                          <li><Link className="dropdown-item" to="/mentorProfile">Profile</Link></li>
                          <li><Link className="dropdown-item" to="/my-students">My Students</Link></li>
                        </>
                      )}
                      <li className="logout">
                        <FontAwesomeIcon className='logout-icon icon-small mt-3 mb-2' icon={faArrowRightToBracket} />
                        <button className="nav-link" id="logout" onClick={handleLogout}>LogOut</button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item" id="navMore">
                    <Link className="nav-link" to="/login"> Log In </Link>
                  </li>
                  <li className="nav-item rounded-5" id="signUp">
                    <Link className="nav-link btn border border-none rounded-5" id="link-color" to="/signup">Sign Up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

