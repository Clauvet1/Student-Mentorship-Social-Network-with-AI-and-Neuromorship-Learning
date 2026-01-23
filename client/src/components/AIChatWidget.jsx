import React, { useState, useRef, useEffect } from "react";
import { getApiUrl, getAuthHeaders } from "../config";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested questions for quick start
  const suggestedQuestions = [
    "How do I find a mentor?",
    "What can my mentor help me with?",
    "How do I request mentorship?",
    "Tips for effective mentorship"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to use the AI Assistant");
    }
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
      
      // Add error message to chat
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
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
    
    // Clear history on server
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

  return (
    <>
      {/* Floating Toggle Button */}
      <div
        className="ai-chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          zIndex: 9999,
          transition: "transform 0.3s ease"
        }}
      >
        {isOpen ? (
          <i className="fas fa-times" style={{ color: "white", fontSize: "24px" }}></i>
        ) : (
          <i className="fas fa-robot" style={{ color: "white", fontSize: "24px" }}></i>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="ai-chat-widget-container"
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "380px",
            maxHeight: "500px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 5px 40px rgba(0, 0, 0, 0.16)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.3s ease"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <i className="fas fa-robot" style={{ fontSize: "20px" }}></i>
              </div>
              <div>
                <h6 style={{ margin: 0, fontWeight: 600 }}>AI Assistant</h6>
                <small style={{ opacity: 0.9, fontSize: "12px" }}>
                  <i className="fas fa-circle" style={{ fontSize: "6px", marginRight: "6px" }}></i>
                  Online
                </small>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={clearChat}
                className="btn btn-sm btn-link text-white p-1"
                title="Clear chat"
                style={{ textDecoration: "none" }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: "#fff3cd",
                color: "#856404",
                fontSize: "13px",
                borderBottom: "1px solid #ffeeba"
              }}
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa"
            }}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center" style={{ padding: "20px 0" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px"
                  }}
                >
                  <i className="fas fa-robot" style={{ color: "white", fontSize: "28px" }}></i>
                </div>
                <h6 style={{ color: "#333", marginBottom: "8px" }}>Hi! I'm your AI Assistant</h6>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px" }}>
                  I can help answer questions about mentorship, study tips, and career advice.
                </p>
                
                {/* Suggested Questions */}
                <div style={{ textAlign: "left" }}>
                  <small style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Suggested questions:
                  </small>
                  <div style={{ marginTop: "8px" }}>
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="btn btn-sm btn-outline-primary mb-2 me-1"
                        style={{
                          fontSize: "12px",
                          borderRadius: "20px",
                          padding: "6px 12px"
                        }}
                      >
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
                className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}
              >
                <div
                  className={`message-bubble p-2 px-3 rounded-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-white text-dark"
                  }`}
                  style={{
                    maxWidth: "80%",
                    boxShadow: msg.role === "assistant" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px"
                  }}
                >
                  <div style={{ fontSize: "14px", lineHeight: 1.5 }}>{msg.content}</div>
                  <small
                    className={`d-block mt-1 ${msg.role === "user" ? "text-light" : "text-muted"}`}
                    style={{ fontSize: "10px" }}
                  >
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
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <div className="d-flex gap-1">
                    <div
                      className="rounded-circle bg-secondary"
                      style={{ width: "8px", height: "8px", animation: "bounce 1.4s infinite ease-in-out" }}
                    ></div>
                    <div
                      className="rounded-circle bg-secondary"
                      style={{
                        width: "8px",
                        height: "8px",
                        animation: "bounce 1.4s infinite ease-in-delay",
                        animationDelay: "0.2s"
                      }}
                    ></div>
                    <div
                      className="rounded-circle bg-secondary"
                      style={{
                        width: "8px",
                        height: "8px",
                        animation: "bounce 1.4s infinite ease-in-delay",
                        animationDelay: "0.4s"
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "white",
              borderTop: "1px solid #eee"
            }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                className="form-control"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  resize: "none",
                  borderRadius: "24px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  height: "42px",
                  maxHeight: "100px"
                }}
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none"
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
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
        .ai-chat-widget-toggle:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

export default AIChatWidget;

