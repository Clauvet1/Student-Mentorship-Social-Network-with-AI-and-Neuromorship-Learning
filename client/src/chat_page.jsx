import React, { useEffect, useState } from "react";
import ChatList from "./components/messaging_components/list/chat_list";
import Chat from "./components/messaging_components/chat/chat";
import ChatDetail from "./components/messaging_components/detail/chat_detail";
import { getApiUrl, getAuthHeaders, apiFetch } from "./config";

const ChatPage = () => {
  const [contacts, setContacts] = useState([]);
  const [allMentors, setAllMentors] = useState([]); // All available mentors
  const [selectedUser, setSelectedUser] = useState(null);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directUser, setDirectUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAllMentors, setShowAllMentors] = useState(true); // Default to showing all mentors for mentees

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    // Check for user parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get("user");

    // Fetch current user info
    console.log("Fetching current user info...");
    fetch(getApiUrl("/api/me"), {
      headers: getAuthHeaders()
    })
      .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Current user data:", data);
        if (!data || (!data._id && !data.id)) {
          console.error("Invalid user data received:", data);
          setError("Could not load user data. Please try logging out and logging in again.");
          setLoading(false);
          return;
        }
        setCurrentUser(data);
        setMyId(data._id || data.id);
        console.log("Setting myId to:", data._id || data.id);
        
        // If a user parameter was passed, try to fetch that user's info directly
        const currentUserId = data._id || data.id;
        if (userParam && userParam !== currentUserId) {
          fetchDirectUser(userParam, token);
        } else {
          fetchContacts(data.role, token);
        }
        
        // Always fetch all mentors - mentees can message any mentor
        if (data.role === "mentee") {
          fetchAllMentors(token);
          setShowAllMentors(true); // Default to showing all mentors
        }
      })
      .catch(err => {
        console.error("Error fetching current user:", err);
        setError(err.message || "Failed to load user information");
        setLoading(false);
        if (err.message.includes("401")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  }, []);

  const fetchAllMentors = (token) => {
    console.log("Fetching all mentors...");
    fetch(getApiUrl("/api/mentors"), {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("All mentors fetched:", data);
        // Convert to consistent format with _id field
        const formattedMentors = data.map(mentor => ({
          ...mentor,
          _id: mentor.id || mentor._id,
          role: "mentor",
          isDirect: true // Mark as available for direct messaging
        }));
        setAllMentors(formattedMentors);
      })
      .catch(err => {
        console.error("Error fetching all mentors:", err);
        setError("Failed to load mentors list");
      });
  };

  const fetchDirectUser = (userId, token) => {
    console.log("Fetching direct user:", userId);
    // For direct messaging, we don't need to check if they're in contacts
    // Just fetch their info directly
    fetch(getApiUrl(`/api/users/${userId}`), {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(user => {
        console.log("Direct user fetched:", user);
        const normalizedUser = {
          ...user,
          _id: user._id || user.id,
          isDirect: true
        };
        setDirectUser(normalizedUser);
        setSelectedUser(normalizedUser);
      })
      .catch(err => {
        console.error("Error fetching user:", err);
        setError("Could not find the requested user");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchContacts = (role, token) => {
    console.log("Fetching contacts for role:", role);
    const endpoint = role === "mentor" ? "/my-mentees" : "/my-mentors";
    fetch(getApiUrl(`/api${endpoint}`), {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Contacts data:", data);
        setContacts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching contacts:", err);
        setError(err.message || "Failed to load your connections");
        setLoading(false);
      });
  };

  const refreshContacts = () => {
    console.log("Refreshing contacts...");
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;
    
    const endpoint = currentUser.role === "mentor" ? "/my-mentees" : "/my-mentors";
    fetch(getApiUrl(`/api${endpoint}`), {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        console.log("Contacts refreshed:", data);
        setContacts(data);
      })
      .catch(err => {
        console.error("Error refreshing contacts:", err);
        setError("Failed to refresh contacts");
      });
  };

  const handleSelectUser = (user) => {
    console.log("User selected:", user);
    setSelectedUser(user);
  };

  const toggleView = () => {
    setShowAllMentors(!showAllMentors);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleBrowseMentors = () => {
    window.location.href = "/mentors";
  };

  if (loading) {
    return (
      <div className="chat-page-loading d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page-error d-flex align-items-center justify-content-center" style={{ height: "calc(100vh - 100px)" }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h5 className="mb-2">Something went wrong</h5>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            <i className="fas fa-redo me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayContacts = showAllMentors && currentUser?.role === "mentee" 
    ? allMentors 
    : contacts;

  const getHeaderTitle = () => {
    if (directUser) return 'Direct Message';
    if (showAllMentors) return 'All Mentors';
    const hasContacts = contacts.length > 0;
    if (!hasContacts) return 'Connections';
    return `My ${contacts[0].role === 'mentor' ? 'Mentors' : 'Mentees'}`;
  };

  const getHeaderSubtitle = () => {
    if (directUser) return 'Starting new conversation';
    if (showAllMentors) return 'Browse all available mentors';
    return 'Your active connections';
  };

  return (
    <div className="chat-page-container">
      <div className="chat-page-row row h-100 m-0">
        {/* Left Section - Contacts List */}
        <div className="col-md-3 col-12 chat-list-section border-end">
          <div className="p-3 bg-light border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0">{getHeaderTitle()}</h5>
                <small className="text-muted">{getHeaderSubtitle()}</small>
              </div>
              {currentUser?.role === "mentee" && contacts.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline-primary chat-view-toggle"
                  onClick={toggleView}
                  title={showAllMentors ? "Show My Mentors" : "Show All Mentors"}
                >
                  <i className={`fas ${showAllMentors ? 'fa-user-friends' : 'fa-users'} me-1`}></i>
                  {showAllMentors ? 'My Mentors' : 'All'}
                </button>
              )}
            </div>
            <small className="d-block text-muted mt-1">
              <i className="fas fa-id-badge me-1"></i>
              Your ID: {myId ? myId.substring(0, 8) + "..." : "Not loaded"}
            </small>
          </div>
          <ChatList 
            contacts={displayContacts} 
            onSelect={handleSelectUser} 
            selectedUser={selectedUser}
            isMentee={currentUser?.role === "mentee"}
            onBrowseMentors={handleBrowseMentors}
          />
          {showAllMentors && (
            <div className="p-3 border-top bg-light chat-list-footer">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                You can message any mentor. If they accept, they'll appear in "My Mentors".
              </small>
            </div>
          )}
        </div>

        {/* Center Section - Chat Conversation */}
        <div className="col-md-6 col-12 chat-section border-end">
          {selectedUser && myId ? (
            <Chat 
              myId={myId} 
              otherUser={selectedUser} 
              onMessageSent={refreshContacts}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted chat-empty-state">
                <div className="chat-empty-icon mb-3">
                  <i className="fas fa-comments fa-3x"></i>
                </div>
                <h6 className="mb-2">
                  {!myId ? "Loading user information..." : "Select a contact to start chatting"}
                </h6>
                {!myId && (
                  <button 
                    className="btn btn-sm btn-primary mt-2"
                    onClick={handleRetry}
                  >
                    <i className="fas fa-redo me-1"></i>Retry Loading
                  </button>
                )}
                {myId && contacts.length === 0 && currentUser?.role === "mentee" && (
                  <div className="mt-3">
                    <p className="small mb-2">No mentors yet? Browse available mentors!</p>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleBrowseMentors}
                    >
                      <i className="fas fa-search me-1"></i>Browse Mentors
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - User Details */}
        <div className="col-md-3 col-12 chat-detail-section">
          {selectedUser ? (
            <ChatDetail activeUser={selectedUser} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <div className="chat-detail-empty-icon mb-2">
                  <i className="fas fa-user fa-3x"></i>
                </div>
                <p>Select a user to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
