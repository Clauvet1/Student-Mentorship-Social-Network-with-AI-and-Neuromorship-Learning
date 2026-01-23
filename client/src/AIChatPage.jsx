import React, { useState, useRef, useEffect } from "react";
import { getApiUrl, getAuthHeaders } from "./config";

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested questions for quick start
  const suggestedQuestions = [
    "How do I find a mentor?",
    "What can my mentor help me with?",
    "How do I request mentorship?",
    "Tips for effective mentorship",
    "How to make the most of my mentorship",
    "What should I discuss with my mentor?"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to use the AI Assistant");
      return;
    }

    fetch(getApiUrl("/api/me"), {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then(data => {
        setUserInfo(data);
      })
      .catch(err => {
        console.error("Error fetching user info:", err);
      });
  }, []);

  const sendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to use the AI Assistant");
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl("/api/ai/chat"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: messageText,
          include_context: true
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get AI response");
      }

      const data = await res.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setError(err.message || "Failed to get response from AI Assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    
    const token = localStorage.getItem("token");
    if (token) {
      fetch(getApiUrl("/api/ai/clear-history"), {
        method: "POST",
        headers: getAuthHeaders()
      }).catch(err => console.error("Failed to clear history:", err));
    }
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  if (error && !userInfo) {
    return (
      <div className="ai-chat-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h5 className="mb-2">Authentication Required</h5>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.href = "/login"}>
            <i className="fas fa-sign-in-alt me-2"></i>Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat-page" style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div className="container py-4" style={{ maxWidth: "800px", height: "calc(100vh - 100px)" }}>
        <div
          className="card"
          style={{
            height: "100%",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)"
          }}
        >
          {/* Header */}
          <div
            className="card-header d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "16px 16px 0 0",
              padding: "20px 24px"
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px"
              }}
            >
              <i className="fas fa-robot" style={{ fontSize: "24px" }}></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0" style={{ fontWeight: 600 }}>AI Mentorship Assistant</h5>
              <small style={{ opacity: 0.9 }}>
                <i className="fas fa-circle text-success me-1" style={{ fontSize: "8px" }}></i>
                Online • Powered by Ollama (Local AI)
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={clearChat}
                className="btn btn-sm btn-light text-dark"
                title="Clear chat history"
                style={{ borderRadius: "8px" }}
              >
                <i className="fas fa-trash-alt me-1"></i>
                Clear
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="card-body overflow-auto"
            style={{
              padding: "24px",
              backgroundColor: "#fafafa",
              height: "calc(100% - 140px)"
            }}
          >
            {/* Welcome Section */}
            {messages.length === 0 && (
              <div className="text-center mb-4" style={{ padding: "20px 0" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                  }}
                >
                  <i className="fas fa-robot" style={{ color: "white", fontSize: "36px" }}></i>
                </div>
                <h4 style={{ color: "#333", marginBottom: "12px" }}>Welcome, {userInfo?.name || "there"}! 👋</h4>
                <p style={{ color: "#666", maxWidth: "500px", margin: "0 auto 24px" }}>
                  I'm your AI Mentorship Assistant. I can help you with questions about mentorship, 
                  study tips, career advice, and navigating our platform.
                </p>

                {/* User Context Info */}
                {userInfo && (
                  <div
                    className="mb-4 p-3 rounded"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      maxWidth: "400px",
                      margin: "0 auto"
                    }}
                  >
                    <small style={{ color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Your Profile
                    </small>
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-2">
                      <span className="badge bg-primary text-capitalize">{userInfo.role}</span>
                      {userInfo.specialty && (
                        <span className="badge bg-info text-dark">{userInfo.specialty}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                <div style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}>
                  <small style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Try asking me:
                  </small>
                  <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="btn btn-sm btn-outline-primary"
                        style={{
                          borderRadius: "20px",
                          padding: "8px 16px",
                          fontSize: "13px"
                        }}
                      >
                        <i className="fas fa-question-circle me-1" style={{ fontSize: "11px" }}></i>
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`message-bubble p-3 px-4 rounded-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-white text-dark"
                  }`}
                  style={{
                    maxWidth: "80%",
                    boxShadow: msg.role === "assistant" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px"
                  }}
                >
                  <div style={{ fontSize: "15px", lineHeight: 1.6 }}>{msg.content}</div>
                  <small
                    className={`d-block mt-2 ${msg.role === "user" ? "text-light" : "text-muted"}`}
                    style={{ fontSize: "11px" }}
                  >
                    {msg.role === "assistant" && (
                      <i className="fas fa-robot me-1"></i>
                    )}
                    {formatTime(msg.timestamp)}
                  </small>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div
                  className="bg-white p-3 rounded-3"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <div className="d-flex gap-2">
                    <div
                      className="rounded-circle"
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#667eea",
                        animation: "bounce 1.4s infinite ease-in-out both"
                      }}
                    ></div>
                    <div
                      className="rounded-circle"
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#667eea",
                        animation: "bounce 1.4s infinite ease-in-out both",
                        animationDelay: "0.2s"
                      }}
                    ></div>
                    <div
                      className="rounded-circle"
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#667eea",
                        animation: "bounce 1.4s infinite ease-in-out both",
                        animationDelay: "0.4s"
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-warning d-flex align-items-center mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <span>{error}</span>
                <button className="btn btn-sm btn-outline-warning ms-auto" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="card-footer"
            style={{
              padding: "16px 24px",
              backgroundColor: "white",
              borderRadius: "0 0 16px 16px",
              borderTop: "1px solid #eee"
            }}
          >
            <div className="d-flex gap-3 align-items-end">
              <div className="flex-grow-1">
                <textarea
                  ref={inputRef}
                  className="form-control"
                  placeholder="Ask me anything about mentorship..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    resize: "none",
                    borderRadius: "24px",
                    padding: "14px 20px",
                    fontSize: "15px",
                    height: "50px",
                    maxHeight: "120px",
                    border: "1px solid #ddd"
                  }}
                  rows="1"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "50px",
                  height: "50px",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                }}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
            <small className="text-muted d-block text-center mt-2" style={{ fontSize: "12px" }}>
              AI responses are generated and may not always be accurate. Verify important information.
            </small>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatPage;

