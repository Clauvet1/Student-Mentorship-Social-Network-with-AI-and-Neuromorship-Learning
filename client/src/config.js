// API Configuration
// This file centralizes all API URLs for easy maintenance

const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  endpoints: {
    // Auth endpoints
    login: "/api/login",
    signup: "/api/signup",
    me: "/api/me",
    
    // User endpoints
    users: "/api/users",
    userById: (userId) => `/api/users/${userId}`,
    mentors: "/api/mentors",
    
    // Mentorship endpoints
    myMentors: "/api/my-mentors",
    myMentees: "/api/my-mentees",
    myRequests: "/api/my-requests",
    requestMentorship: (mentorId) => `/api/request-mentorship/${mentorId}`,
    addMentor: (mentorId) => `/api/add-mentor/${mentorId}`,
    acceptRequest: (requestId) => `/api/accept-request/${requestId}`,
    rejectRequest: (requestId) => `/api/reject-request/${requestId}`,
    activeMentorships: "/api/active-mentorships",
    conversations: "/api/conversations",
    
    // Message endpoints
    sendMessage: "/api/messages/send",
    getMessages: (user1, user2) => `/api/messages/${user1}/${user2}`
  }
};

export default API_CONFIG;

// Helper function to build full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

// Generic fetch wrapper with error handling
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultHeaders = getAuthHeaders();
  const mergedHeaders = { ...defaultHeaders, ...options.headers };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

