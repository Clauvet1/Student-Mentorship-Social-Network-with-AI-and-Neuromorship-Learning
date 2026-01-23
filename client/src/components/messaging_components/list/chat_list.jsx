import React from "react";

const ChatList = ({ contacts, onSelect, selectedUser, isStudent, onBrowse }) => {
  // Helper to get consistent contact ID
  const getContactId = (contact) => contact._id || contact.id;

  if (contacts.length === 0) {
    return (
      <div className="chat-list-container h-100">
        <div className="chat-list-empty p-4 text-center">
          <div className="empty-icon mb-3">
            <i className="fas fa-users fa-3x text-muted"></i>
          </div>
          <h6 className="text-muted mb-2">
            {isStudent ? "No mentors yet" : "No students yet"}
          </h6>
          <p className="text-muted small mb-3">
            {isStudent 
              ? "You haven't connected with any mentors. Browse available mentors to start chatting!"
              : "You can message any student directly. Browse students to start chatting!"}
          </p>
          {onBrowse && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={onBrowse}
            >
              <i className="fas fa-search me-1"></i>
              {isStudent ? "Browse Mentors" : "Browse Students"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container h-100">
      <div className="chat-list-items">
        {contacts.map((contact) => {
          const contactId = getContactId(contact);
          const isSelected = selectedUser && (
            selectedUser._id === contactId || 
            selectedUser.id === contactId ||
            getContactId(selectedUser) === contactId
          );
          
          return (
            <div
              key={contactId}
              className={`chat-list-item p-3 border-bottom d-flex align-items-center ${isSelected ? 'bg-light selected' : ''}`}
              onClick={() => onSelect(contact)}
              style={{ cursor: "pointer" }}
            >
              <div className="avatar me-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", fontSize: "20px" }}>
                  {contact.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="user-info flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="m-0">{contact.name}</h6>
                  <span className="badge bg-secondary text-capitalize">{contact.role}</span>
                </div>
                {contact.specialty && (
                  <small className="text-muted d-block">{contact.specialty}</small>
                )}
                {contact.email && (
                  <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                    <i className="fas fa-envelope me-1" style={{ fontSize: "0.7rem" }}></i>
                    {contact.email}
                  </small>
                )}
              </div>
              {isSelected && (
                <div className="selected-indicator ms-2">
                  <i className="fas fa-chevron-right text-primary"></i>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Browse Button - Shown when there are contacts too */}
      {onBrowse && contacts.length > 0 && (
        <div className="p-3 border-top bg-light">
          <button 
            className="btn btn-outline-primary w-100"
            onClick={onBrowse}
          >
            <i className="fas fa-search me-2"></i>
            {isStudent ? "Browse More Mentors" : "Browse More Students"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatList;

