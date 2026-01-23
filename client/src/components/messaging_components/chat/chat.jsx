import React, { useEffect, useState, useRef } from "react";
import { getApiUrl, getAuthHeaders } from "../../../config";

const Chat = ({ myId, otherUser, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Fetch messages when user is selected
  useEffect(() => {
    if (myId && otherUser) {
      const otherUserId = otherUser._id || otherUser.id;
      if (!otherUserId) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }
      
      const fetchMessages = () => {
        fetch(getApiUrl(`/api/messages/${myId}/${otherUserId}`), {
          headers: getAuthHeaders()
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            setMessages(data || []);
            setError(null);
          })
          .catch(err => {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages");
          })
          .finally(() => {
            setLoading(false);
          });
      };

      fetchMessages();
      refreshIntervalRef.current = setInterval(fetchMessages, 5000);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [myId, otherUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const sendMessage = async () => {
    if (!text.trim() || !myId || !otherUser) return;

    const otherUserId = otherUser._id || otherUser.id;
    if (!otherUserId) {
      setError("Invalid user ID for recipient");
      return;
    }

    setSending(true);
    setError(null);
    
    try {
      const res = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sender_id: myId,
          receiver_id: otherUserId,
          content: text
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to send message");
        return;
      }

      const savedMsg = await res.json();
      setMessages(prev => [...prev, savedMsg]);
      setText("");
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError("Failed to send message. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const otherUserId = otherUser._id || otherUser.id;
    fetch(getApiUrl(`/api/messages/${myId}/${otherUserId}`), {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setMessages(data || []);
        setError(null);
      })
      .catch(err => {
        setError("Failed to load messages");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="chat-container d-flex flex-column h-100">
        <div className="chat-loading d-flex align-items-center justify-content-center flex-grow-1">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </div>
            <p className="mt-2 text-muted">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="chat-container d-flex flex-column h-100">
        <div className="chat-error d-flex align-items-center justify-content-center flex-grow-1">
          <div className="text-center">
            <i className="fas fa-exclamation-circle fa-2x text-warning mb-3"></i>
            <p className="text-muted mb-3">{error}</p>
            <button className="btn btn-sm btn-primary" onClick={handleRetry}>
              <i className="fas fa-redo me-1"></i>Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container d-flex flex-column h-100">
      {/* Chat Header */}
      <div className="chat-header p-3 border-bottom bg-light d-flex align-items-center">
        <div className="avatar me-3">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
            {otherUser?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h6 className="m-0">{otherUser?.name}</h6>
          <small className="text-muted text-capitalize">{otherUser?.role}</small>
        </div>
        <div className="ms-auto">
          <small className="text-muted">
            <i className="fas fa-circle text-success" style={{ fontSize: "0.5rem" }}></i> Online
          </small>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: "#f5f5f5" }}>
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <div className="chat-empty-icon mb-3">
              <i className="fas fa-comment-dots fa-3x"></i>
            </div>
            <h6 className="mb-2">No messages yet</h6>
            <p className="small">Start the conversation!</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={`message mb-2 d-flex ${m.sender_id === myId ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`message-bubble p-2 px-3 rounded-3 ${m.sender_id === myId ? "bg-primary text-white" : "bg-white"}`}
                style={{ 
                  maxWidth: "70%",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.1)"
                }}
              >
                <div className="message-content">{m.content}</div>
                <small className={`d-block mt-1 ${m.sender_id === myId ? "text-light" : "text-muted"}`} style={{ fontSize: "0.7rem" }}>
                  {formatTime(m.timestamp)}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <div className="chat-input p-3 border-top bg-white d-flex align-items-center">
          <textarea
            ref={textareaRef}
            className="form-control rounded-pill me-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ 
              backgroundColor: "#f0f0f0",
              resize: "none",
              height: "45px",
              overflow: "hidden",
              padding: "0.75rem 1rem",
              lineHeight: "1.5",
              border: "1px solid #ced4da"
            }}
            rows="1"
            disabled={sending}
          />
          <button 
            type="submit"
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: "45px", 
              height: "45px",
              flexShrink: 0
            }}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function to format timestamp
function formatTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return "";
  }
}

export default Chat;

