from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class Message(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # mentor / student
    specialty: str = ""
    bio: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    _id: str
    name: str
    email: EmailStr
    role: str
    specialty: str = ""
    bio: str = ""


class MentorshipRequest(BaseModel):
    mentor_id: str
    mentee_id: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Mentorship(BaseModel):
    mentor_id: str
    mentee_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
