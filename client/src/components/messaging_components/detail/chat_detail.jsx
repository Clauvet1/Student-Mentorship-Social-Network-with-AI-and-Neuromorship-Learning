import React from "react";

const ChatDetail = ({ activeUser }) => {
  if (!activeUser) {
    return (
      <div className="chat-detail-container h-100">
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center text-muted">
            <i className="fas fa-user fa-2x mb-2"></i>
            <p>Select a user to view details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-detail-container h-100">
      {/* Profile Header */}
      <div className="text-center p-4 border-bottom">
        <div className="avatar mx-auto mb-3">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px", fontSize: "32px" }}>
            {activeUser?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <h5 className="mb-1">{activeUser?.name}</h5>
        <span className="badge bg-primary text-capitalize">{activeUser?.role}</span>
      </div>

      {/* User Info */}
      <div className="p-3">
        <h6 className="text-muted mb-3">Contact Info</h6>
        
        <div className="info-item mb-3">
          <small className="text-muted d-block">
            <i className="fas fa-envelope me-1"></i>Email
          </small>
          <span>{activeUser?.email || "Not available"}</span>
        </div>

        <div className="info-item mb-3">
          <small className="text-muted d-block">
            <i className="fas fa-user-tag me-1"></i>Role
          </small>
          <span className="text-capitalize">{activeUser?.role || "Not specified"}</span>
        </div>

        {activeUser?.specialty && (
          <div className="info-item mb-3">
            <small className="text-muted d-block">
              <i className="fas fa-star me-1"></i>Specialty
            </small>
            <span>{activeUser.specialty}</span>
          </div>
        )}
        
        {activeUser?.bio && (
          <div className="info-item mb-3">
            <small className="text-muted d-block">
              <i className="fas fa-info-circle me-1"></i>About
            </small>
            <p className="mb-0 mt-1">{activeUser.bio}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-top">
        <h6 className="text-muted mb-3">Quick Actions</h6>
        <div className="d-grid gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <i className="fas fa-user-plus me-1"></i>View Full Profile
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="fas fa-calendar me-1"></i>Schedule Meeting
          </button>
        </div>
      </div>

      {/* Media / Shared Media Section */}
      <div className="p-3 border-top">
        <h6 className="text-muted mb-3">Shared Media</h6>
        <div className="text-center text-muted py-4">
          <div className="shared-media-empty mb-2">
            <i className="fas fa-image fa-2x"></i>
          </div>
          <p className="mb-0 small">No shared media yet</p>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;

