from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import List
import os
import openai
from database import messages, mentorship_requests, mentorships
from models import Message, UserResponse, MentorshipRequest, Mentorship
from database import users
from models import User
from authentication import hash_password, verify_password, create_token, verify_token

router = APIRouter(prefix="/api")


@router.post("/messages/send")
def send_message(msg: Message):
    result = messages.insert_one(msg.model_dump())
    saved_message = msg.model_dump()
    saved_message["_id"] = str(result.inserted_id)
    saved_message["timestamp"] = saved_message["timestamp"].isoformat()
    return saved_message


@router.get("/messages/{user1}/{user2}")
def get_messages(user1: str, user2: str):
    chat = messages.find({
        "$or": [
            {"sender_id": user1, "receiver_id": user2},
            {"sender_id": user2, "receiver_id": user1}
        ]
    }).sort("timestamp", 1)

    chat_list = []

    for msg in chat:
        msg["_id"] = str(msg["_id"])
        msg["timestamp"] = msg["timestamp"].isoformat()
        chat_list.append(msg)

    return chat_list


# Authentication routes

@router.post("/signup")
def signup(user: User):
    if users.find_one({"email": user.email}):
        raise HTTPException(400, "User exists")

    user.password = hash_password(user.password)
    users.insert_one(user.model_dump())

    return {"status": "Account created"}

@router.post("/login")
def login(data: dict):
    db_user = users.find_one({"email": data["email"]})
    if not db_user:
        return {"detail": "Invalid credentials"}

    if not verify_password(data["password"], db_user["password"]):
        return {"detail": "Invalid credentials"}

    # Include role, user ID and user info in the token payload for client-side use
    token = create_token({
        "sub": db_user["email"],
        "role": db_user.get("role", ""),
        "userType": db_user.get("role", ""),  # For Navbar.js compatibility
        "userName": db_user.get("name", ""),  # For Navbar.js compatibility
        "email": db_user.get("email", ""),
        "userId": str(db_user["_id"])  # Add user ID to token
    })
    return {"token": token}


@router.get("/users")
def get_users():
    all_users = list(users.find({}, {"password": 0}))
    user_list = []
    for user in all_users:
        user_id = str(user["_id"])
        user["_id"] = user_id
        user["id"] = user_id  # Add id field for consistency
        user_list.append(user)
    return user_list


@router.get("/users/{user_id}")
def get_user_by_id(user_id: str):
    """Get a specific user by ID"""
    try:
        user = users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if user:
            user["_id"] = str(user["_id"])
            return user
        raise HTTPException(404, "User not found")
    except Exception:
        raise HTTPException(400, "Invalid user ID")


@router.get("/mentors")
def get_mentors():
    """Get all mentors with their details"""
    all_mentors = list(users.find({"role": "mentor"}, {"password": 0}))
    mentor_list = []
    for mentor in all_mentors:
        mentor_obj = {
            "id": str(mentor["_id"]),
            "fullName": mentor.get("name", ""),
            "name": mentor.get("name", ""),
            "email": mentor.get("email", ""),
            "role": mentor.get("role", ""),
            "specialty": mentor.get("specialty", ""),
            "bio": mentor.get("bio", ""),
            "school": mentor.get("school", ""),
            "department": mentor.get("department", ""),
            "location": mentor.get("location", ""),
            "phone": mentor.get("phone", "")
        }
        mentor_list.append(mentor_obj)
    return mentor_list


@router.get("/mentors/search")
def search_mentors(q: str = ""):
    """Search mentors by name, specialty, or school"""
    search_query = q.strip()
    
    if not search_query:
        # If no search query, return all mentors
        return get_mentors()
    
    # Create regex pattern for case-insensitive search
    import re
    pattern = re.compile(re.escape(search_query), re.IGNORECASE)
    
    # Search across multiple fields
    all_mentors = list(users.find({
        "role": "mentor",
        "$or": [
            {"name": {"$regex": pattern}},
            {"specialty": {"$regex": pattern}},
            {"school": {"$regex": pattern}},
            {"department": {"$regex": pattern}},
            {"bio": {"$regex": pattern}}
        ]
    }, {"password": 0}))
    
    mentor_list = []
    for mentor in all_mentors:
        mentor_obj = {
            "id": str(mentor["_id"]),
            "fullName": mentor.get("name", ""),
            "name": mentor.get("name", ""),
            "email": mentor.get("email", ""),
            "role": mentor.get("role", ""),
            "specialty": mentor.get("specialty", ""),
            "bio": mentor.get("bio", ""),
            "school": mentor.get("school", ""),
            "department": mentor.get("department", ""),
            "location": mentor.get("location", ""),
            "phone": mentor.get("phone", "")
        }
        mentor_list.append(mentor_obj)
    
    return mentor_list


@router.post("/add-mentor/{mentor_id}")
def add_mentor(mentor_id: str, request: Request):
    """Add a mentor to current user's mentor list"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    # Check if mentor exists
    mentor = users.find_one({"_id": mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(404, "Mentor not found")
    
    # Add mentor to current user's my_mentors list
    users.update_one(
        {"email": current_email},
        {"$addToSet": {"my_mentors": mentor_id}}
    )
    
    return {"status": "Mentor added successfully"}


# Mentorship Request Routes

@router.post("/request-mentorship/{mentor_id}")
def request_mentorship(mentor_id: str, request: Request):
    """Student sends mentorship request to a mentor"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    if current_user.get("role") not in ["student", "mentee"]:
        raise HTTPException(403, "Only students can request mentorship")
    
    # Convert mentor_id to ObjectId for MongoDB query
    try:
        mentor_object_id = ObjectId(mentor_id)
    except Exception:
        raise HTTPException(400, "Invalid mentor ID format")
    
    # Check if mentor exists
    mentor = users.find_one({"_id": mentor_object_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(404, "Mentor not found")
    
    # Ensure we use string ID for storage
    mentor_id_str = str(mentor_object_id)
    student_id_str = str(current_user["_id"])
    
    # Check if request already exists
    existing = mentorship_requests.find_one({
        "mentor_id": mentor_id_str,
        "student_id": student_id_str,
        "status": {"$in": ["pending", "accepted"]}
    })
    if existing:
        raise HTTPException(400, "Mentorship request already exists")
    
    # Create request
    mentorship_requests.insert_one({
        "mentor_id": mentor_id_str,
        "mentor_name": mentor.get("name", ""),
        "mentor_email": mentor.get("email", ""),
        "student_id": student_id_str,
        "student_name": current_user["name"],
        "student_email": current_user["email"],
        "status": "pending",
        "created_at": datetime.utcnow()
    })
    
    return {"status": "Mentorship request sent"}


@router.get("/my-requests")
def get_my_requests(request: Request):
    """Get mentorship requests for the current user (mentors see requests, students see their requests)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    
    if current_user.get("role") == "mentor":
        # Mentor sees requests sent to them (convert to ObjectId for query)
        try:
            mentor_object_id = ObjectId(current_user_id)
        except Exception:
            mentor_object_id = current_user_id
        user_requests = list(mentorship_requests.find({
            "mentor_id": current_user_id,
            "status": "pending"
        }))
    else:
        # Student sees their sent requests
        user_requests = list(mentorship_requests.find({
            "student_id": current_user_id
        }))
    
    # Convert ObjectIds to strings
    for req in user_requests:
        req["_id"] = str(req["_id"])
        if "created_at" in req:
            req["created_at"] = req["created_at"].isoformat()
    
    return user_requests


@router.post("/accept-request/{request_id}")
def accept_request(request_id: str, request: Request):
    """Mentor accepts a mentorship request"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    if current_user.get("role") != "mentor":
        raise HTTPException(403, "Only mentors can accept requests")
    
    # Convert request_id to ObjectId for MongoDB query
    try:
        request_object_id = ObjectId(request_id)
    except Exception:
        raise HTTPException(400, "Invalid request ID format")
    
    # Find the request
    req = mentorship_requests.find_one({"_id": request_object_id})
    if not req:
        raise HTTPException(404, "Request not found")
    
    # Get mentor_id from request and convert to string for comparison
    stored_mentor_id = req.get("mentor_id")
    if isinstance(stored_mentor_id, ObjectId):
        stored_mentor_id = str(stored_mentor_id)
    
    current_user_id = str(current_user["_id"])
    
    if stored_mentor_id != current_user_id:
        raise HTTPException(403, "Not authorized to accept this request")
    
    if req.get("status") != "pending":
        raise HTTPException(400, "Request already processed")
    
    # Update request status
    mentorship_requests.update_one(
        {"_id": request_object_id},
        {"$set": {"status": "accepted"}}
    )
    
    # Get student_id and ensure it's a string
    student_id = req.get("student_id")
    if isinstance(student_id, ObjectId):
        student_id = str(student_id)
    
    # Create mentorship relationship
    mentorships.insert_one({
        "mentor_id": current_user_id,
        "student_id": student_id,
        "created_at": datetime.utcnow()
    })
    
    return {"status": "Request accepted"}


@router.post("/reject-request/{request_id}")
def reject_request(request_id: str, request: Request):
    """Mentor rejects a mentorship request"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    if current_user.get("role") != "mentor":
        raise HTTPException(403, "Only mentors can reject requests")
    
    # Convert request_id to ObjectId for MongoDB query
    try:
        request_object_id = ObjectId(request_id)
    except Exception:
        raise HTTPException(400, "Invalid request ID format")
    
    # Find the request
    req = mentorship_requests.find_one({"_id": request_object_id})
    if not req:
        raise HTTPException(404, "Request not found")
    
    if req["mentor_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Not authorized to reject this request")
    
    # Update request status
    mentorship_requests.update_one(
        {"_id": request_object_id},
        {"$set": {"status": "rejected"}}
    )
    
    return {"status": "Request rejected"}


@router.get("/my-mentors")
def get_my_mentors(request: Request):
    """Get list of mentors for the current student"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    
    # Get accepted mentorships
    user_mentorships = list(mentorships.find({"student_id": current_user_id}))
    
    mentor_list = []
    for ms in user_mentorships:
        mentor = users.find_one({"_id": ms["mentor_id"]})
        if mentor:
            mentor_list.append({
                "_id": str(mentor["_id"]),
                "name": mentor["name"],
                "email": mentor["email"],
                "role": mentor["role"],
                "specialty": mentor.get("specialty", "")
            })
    
    return mentor_list


@router.get("/my-students")
def get_my_students(request: Request):
    """Get list of students for the current mentor"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    
    # Convert to ObjectId for proper MongoDB querying
    try:
        current_object_id = ObjectId(current_user_id)
    except Exception:
        current_object_id = current_user_id
    
    # Query both string and ObjectId formats for compatibility
    user_mentorships = list(mentorships.find({
        "$or": [
            {"mentor_id": current_user_id},
            {"mentor_id": current_object_id}
        ]
    }))
    
    student_list = []
    for ms in user_mentorships:
        student_id = ms.get("student_id")
        if student_id:
            # Convert ObjectId to string if needed
            student_id_str = str(student_id) if isinstance(student_id, ObjectId) else student_id
            student = users.find_one({"_id": student_id_str})
            if student:
                student_list.append({
                    "_id": str(student["_id"]),
                    "name": student["name"],
                    "email": student["email"],
                    "role": student["role"]
                })
    
    return student_list


# Backwards compatibility endpoint
@router.get("/my-mentees")
def get_my_mentees(request: Request):
    """Get list of students for the current mentor (backwards compatibility)"""
    return get_my_students(request)


@router.get("/active-mentorships")
def get_active_mentorships(request: Request):
    """Get all active mentorship relationships for the current user to use for messaging"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    user_role = current_user.get("role")
    
    # Convert to ObjectId for proper MongoDB querying
    try:
        current_object_id = ObjectId(current_user_id)
    except Exception:
        current_object_id = current_user_id
    
    if user_role == "mentor":
        # Get all students - query both string and ObjectId formats for compatibility
        user_mentorships = list(mentorships.find({
            "$or": [
                {"mentor_id": current_user_id},
                {"mentor_id": current_object_id}
            ]
        }))
        partner_field = "student_id"
    else:
        # Get all mentors - query both string and ObjectId formats for compatibility
        user_mentorships = list(mentorships.find({
            "$or": [
                {"student_id": current_user_id},
                {"student_id": current_object_id}
            ]
        }))
        partner_field = "mentor_id"
    
    partner_list = []
    for ms in user_mentorships:
        partner_id = ms.get(partner_field)
        if partner_id:
            # Convert ObjectId to string if needed
            partner_id_str = str(partner_id) if isinstance(partner_id, ObjectId) else partner_id
            partner = users.find_one({"_id": partner_id_str})
            if partner:
                partner_list.append({
                    "_id": str(partner["_id"]),
                    "name": partner["name"],
                    "email": partner["email"],
                    "role": partner["role"],
                    "specialty": partner.get("specialty", "")
                })
    
    return partner_list


@router.get("/conversations")
def get_conversations(request: Request):
    """Get all conversations for the current user with last message preview"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    
    # Get all messages involving this user
    all_messages = messages.find({
        "$or": [
            {"sender_id": current_user_id},
            {"receiver_id": current_user_id}
        ]
    }).sort("timestamp", -1)
    
    # Group by conversation partner
    conversations = {}
    for msg in all_messages:
        partner_id = msg["receiver_id"] if msg["sender_id"] == current_user_id else msg["sender_id"]
        
        if partner_id not in conversations:
            # Get partner info
            partner = users.find_one({"_id": partner_id})
            if partner:
                conversations[partner_id] = {
                    "user": {
                        "_id": str(partner["_id"]),
                        "name": partner["name"],
                        "email": partner["email"],
                        "role": partner["role"]
                    },
                    "last_message": {
                        "content": msg["content"],
                        "timestamp": msg["timestamp"].isoformat() if hasattr(msg["timestamp"], 'isoformat') else str(msg["timestamp"]),
                        "sender_id": msg["sender_id"]
                    }
                }
    
    return list(conversations.values())


@router.get("/me")
def get_me(request: Request):
    """Get current user information"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Return user data in a clean format
    return {
        "_id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "specialty": user.get("specialty", ""),
        "bio": user.get("bio", "")
    }


# Profile Endpoints

@router.get("/student-profile")
def get_student_profile(request: Request):
    """Get the current logged-in student's profile"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only students can access this endpoint
    if user.get("role") not in ["student", "mentee"]:
        raise HTTPException(403, "Only students can access this endpoint")
    
    return {
        "_id": str(user["_id"]),
        "fullName": user.get("name", ""),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "language": user.get("language", ""),
        "school": user.get("school", ""),
        "department": user.get("department", ""),
        "specialty": user.get("specialty", ""),
        "skills": user.get("skills", ""),
        "bio": user.get("bio", "")
    }


@router.get("/mentor-profile")
def get_mentor_profile(request: Request):
    """Get the current logged-in mentor's profile"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only mentors can access this endpoint
    if user.get("role") != "mentor":
        raise HTTPException(403, "Only mentors can access this endpoint")
    
    return {
        "_id": str(user["_id"]),
        "fullName": user.get("name", ""),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "language": user.get("language", ""),
        "school": user.get("school", ""),
        "department": user.get("department", ""),
        "specialty": user.get("specialty", ""),
        "skills": user.get("skills", ""),
        "bio": user.get("bio", "")
    }


@router.put("/editStudentProfile")
def edit_student_profile(request: Request, body: dict):
    """Update the current student's profile"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only students can access this endpoint
    if user.get("role") not in ["student", "mentee"]:
        raise HTTPException(403, "Only students can access this endpoint")
    
    # Fields that can be updated
    allowed_fields = ["fullName", "name", "phone", "location", "language", "school", "department", "specialty", "skills", "bio"]
    
    # Build update dict with only allowed fields
    update_dict = {}
    for field in allowed_fields:
        if field in body:
            update_dict[field] = body[field]
    
    # Map fullName to name
    if "fullName" in update_dict:
        update_dict["name"] = update_dict.pop("fullName")
    
    if update_dict:
        users.update_one({"email": email}, {"$set": update_dict})
    
    return {"status": "Profile updated successfully"}


@router.put("/editMentorProfile")
def edit_mentor_profile(request: Request, body: dict):
    """Update the current mentor's profile"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only mentors can access this endpoint
    if user.get("role") != "mentor":
        raise HTTPException(403, "Only mentors can access this endpoint")
    
    # Fields that can be updated
    allowed_fields = ["fullName", "name", "phone", "location", "language", "school", "department", "specialty", "skills", "bio"]
    
    # Build update dict with only allowed fields
    update_dict = {}
    for field in allowed_fields:
        if field in body:
            update_dict[field] = body[field]
    
    # Map fullName to name
    if "fullName" in update_dict:
        update_dict["name"] = update_dict.pop("fullName")
    
    if update_dict:
        users.update_one({"email": email}, {"$set": update_dict})
    
    return {"status": "Profile updated successfully"}


@router.get("/student-profile-view/{user_id}")
def get_student_profile_view(user_id: str, request: Request):
    """View any student's profile by ID"""
    try:
        user = users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except Exception:
        raise HTTPException(400, "Invalid user ID")
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only return student profiles
    if user.get("role") not in ["student", "mentee"]:
        raise HTTPException(404, "Student not found")
    
    return {
        "_id": str(user["_id"]),
        "id": str(user["_id"]),
        "fullName": user.get("name", ""),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "language": user.get("language", ""),
        "school": user.get("school", ""),
        "department": user.get("department", ""),
        "specialty": user.get("specialty", ""),
        "skills": user.get("skills", ""),
        "bio": user.get("bio", "")
    }


@router.get("/mentor-profile-view/{user_id}")
def get_mentor_profile_view(user_id: str, request: Request):
    """View any mentor's profile by ID"""
    try:
        user = users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except Exception:
        raise HTTPException(400, "Invalid user ID")
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Only return mentor profiles
    if user.get("role") != "mentor":
        raise HTTPException(404, "Mentor not found")
    
    return {
        "_id": str(user["_id"]),
        "id": str(user["_id"]),
        "fullName": user.get("name", ""),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "language": user.get("language", ""),
        "school": user.get("school", ""),
        "department": user.get("department", ""),
        "specialty": user.get("specialty", ""),
        "skills": user.get("skills", ""),
        "bio": user.get("bio", "")
    }


# Debug endpoint to check mentorships collection
@router.get("/debug-mentorships")
def debug_mentorships(request: Request):
    """Debug endpoint to check mentorships data"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    
    # Get all mentorships
    all_mentorships = list(mentorships.find({}))
    
    # Get mentorships for this user
    user_mentorships = list(mentorships.find({
        "$or": [
            {"mentor_id": current_user_id},
            {"mentor_id": ObjectId(current_user_id)}
        ]
    }))
    
    # Get all requests
    all_requests = list(mentorship_requests.find({}))
    
    return {
        "current_user_id": current_user_id,
        "current_user_email": current_email,
        "all_mentorships_count": len(all_mentorships),
        "user_mentorships": user_mentorships,
        "all_requests_count": len(all_requests),
        "sample_mentorship": all_mentorships[0] if all_mentorships else None
    }


# ==================== AI Chat Assistant Endpoints ====================

# Initialize Ollama client (OpenAI-compatible API)
def get_ollama_client():
    """Get Ollama client configured for local AI"""
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    print(f"DEBUG: OLLAMA_BASE_URL: {base_url}")
    
    try:
        client = openai.OpenAI(
            api_key="ollama",  # Ollama doesn't require a real API key
            base_url=base_url
        )
        print("DEBUG: Ollama client created successfully")
        return client
    except Exception as e:
        print(f"DEBUG: Error creating Ollama client: {e}")
        return None


def get_ollama_model():
    """Get the configured Ollama model name"""
    # Default to phi model which is smaller and works with limited memory
    # Users can change this to llama2, tinyllama, or other models if they have more RAM
    return os.environ.get("OLLAMA_MODEL", "phi")


# In-memory conversation history (per user session)
# In production, you might want to use a database or Redis
conversation_histories = {}


@router.get("/ai/context")
def get_ai_context(request: Request):
    """Get user context for AI assistant"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    current_user_id = str(current_user["_id"])
    user_role = current_user.get("role", "")
    
    # Build context
    context = {
        "user": {
            "name": current_user.get("name", ""),
            "email": current_user.get("email", ""),
            "role": user_role,
            "specialty": current_user.get("specialty", ""),
            "bio": current_user.get("bio", ""),
            "school": current_user.get("school", ""),
            "department": current_user.get("department", "")
        },
        "mentors": [],
        "mentees": [],
        "pending_requests": [],
        "platform_info": {
            "name": "Student Mentorship Social Network",
            "description": "A platform connecting students with mentors for guidance and support"
        }
    }
    
    # Get user's mentors (if student)
    if user_role in ["student", "mentee"]:
        user_mentorships = list(mentorships.find({"student_id": current_user_id}))
        for ms in user_mentorships:
            mentor_id = ms.get("mentor_id")
            if mentor_id:
                # Convert ObjectId to string if needed
                mentor_id_str = str(mentor_id) if isinstance(mentor_id, ObjectId) else mentor_id
                mentor = users.find_one({"_id": mentor_id_str})
                if mentor:
                    context["mentors"].append({
                        "name": mentor.get("name", ""),
                        "specialty": mentor.get("specialty", ""),
                        "bio": mentor.get("bio", "")
                    })
        
        # Get pending requests
        pending = list(mentorship_requests.find({
            "student_id": current_user_id,
            "status": "pending"
        }))
        context["pending_requests"] = [
            {"mentor_name": p.get("mentor_name", ""), "status": p.get("status", "")}
            for p in pending
        ]
    
    # Get user's mentees (if mentor)
    if user_role == "mentor":
        user_mentorships = list(mentorships.find({
            "$or": [
                {"mentor_id": current_user_id},
                {"mentor_id": ObjectId(current_user_id)}
            ]
        }))
        for ms in user_mentorships:
            student_id = ms.get("student_id")
            if student_id:
                # Convert ObjectId to string if needed
                student_id_str = str(student_id) if isinstance(student_id, ObjectId) else student_id
                student = users.find_one({"_id": student_id_str})
                if student:
                    context["mentees"].append({
                        "name": student.get("name", ""),
                        "specialty": student.get("specialty", ""),
                        "bio": student.get("bio", ""),
                        "school": student.get("school", "")
                    })
        
        # Get pending requests
        pending = list(mentorship_requests.find({
            "mentor_id": current_user_id,
            "status": "pending"
        }))
        context["pending_requests"] = [
            {"student_name": p.get("student_name", ""), "status": p.get("status", "")}
            for p in pending
        ]
    
    return context


class AIChatRequest(BaseModel):
    message: str
    include_context: bool = True


@router.post("/ai/chat")
async def ai_chat(request: Request, chat_request: AIChatRequest):
    """AI Chat Assistant endpoint"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    user_id = str(current_user["_id"])
    user_name = current_user.get("name", "")
    user_role = current_user.get("role", "")
    
    # Initialize conversation history for this user
    if user_id not in conversation_histories:
        conversation_histories[user_id] = []
    
    # Get context if requested
    context_data = {}
    if chat_request.include_context:
        try:
            context_response = get_ai_context(request)
            context_data = context_response
        except Exception:
            context_data = {"error": "Could not fetch context"}
    
    # Build system message with context
    system_message = """You are an AI Mentorship Assistant for a Student Mentorship Social Network. 
Your role is to help users with:
1. Answering questions about the mentorship platform
2. Providing guidance on mentorship relationships
3. Giving study and career advice
4. Helping with platform navigation and features

Be helpful, friendly, and supportive. Keep responses concise but informative.
If you don't know something, be honest about it.
"""
    
    # Add user context to system message if available
    if context_data and "user" in context_data:
        user = context_data["user"]
        system_message += f"\n\nCurrent user information:\n"
        system_message += f"- Name: {user.get('name', 'N/A')}\n"
        system_message += f"- Role: {user.get('role', 'N/A')}\n"
        system_message += f"- Specialty/Interest: {user.get('specialty', 'N/A')}\n"
        
        if context_data.get("mentors"):
            system_message += f"\nYour Mentors:\n"
            for mentor in context_data["mentors"][:3]:  # Limit to 3
                system_message += f"- {mentor.get('name', 'N/A')} ({mentor.get('specialty', 'N/A')})\n"
        
        if context_data.get("mentees"):
            system_message += f"\nYour Mentees:\n"
            for mentee in context_data["mentees"][:3]:  # Limit to 3
                system_message += f"- {mentee.get('name', 'N/A')} ({mentee.get('specialty', 'N/A')})\n"
        
        if context_data.get("pending_requests"):
            system_message += f"\nPending Requests: {len(context_data['pending_requests'])}\n"
    
    # Add conversation history
    messages = [{"role": "system", "content": system_message}]
    
    # Add last 10 messages from conversation history
    for msg in conversation_histories[user_id][-10:]:
        messages.append(msg)
    
    # Add user message
    messages.append({"role": "user", "content": chat_request.message})
    
    # Get Ollama client
    client = get_ollama_client()
    ollama_model = get_ollama_model()
    
    if not client:
        # Fallback response if Ollama is not configured
        return {
            "response": "I'm sorry, but the local AI assistant is not running. Please make sure Ollama is installed and running with the llama2 model pulled.",
            "context_used": False
        }
    
    try:
        # Call Ollama API
        response = client.chat.completions.create(
            model=ollama_model,
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Update conversation history
        conversation_histories[user_id].append({"role": "user", "content": chat_request.message})
        conversation_histories[user_id].append({"role": "assistant", "content": ai_response})
        
        # Keep only last 20 messages to prevent memory bloat
        if len(conversation_histories[user_id]) > 20:
            conversation_histories[user_id] = conversation_histories[user_id][-20:]
        
        return {
            "response": ai_response,
            "context_used": True
        }
        
    except Exception as e:
        error_str = str(e)
        print(f"Ollama API Error: {error_str}")

        # Handle specific Ollama errors
        if "connection" in error_str.lower() or "refused" in error_str.lower():
            raise HTTPException(503, "AI service unavailable: Cannot connect to Ollama. Please make sure Ollama is running locally on port 11434.")
        elif "model" in error_str.lower() and ("not found" in error_str.lower() or "not exist" in error_str.lower()):
            raise HTTPException(404, f"AI model not found: The model '{ollama_model}' is not available. Please run 'ollama pull {ollama_model}' to download it.")
        elif "rate_limit" in error_str.lower() or "429" in error_str:
            raise HTTPException(429, "AI service temporarily unavailable: Rate limit exceeded. Please try again in a moment.")
        else:
            raise HTTPException(500, f"AI service error: {error_str}")


@router.post("/ai/clear-history")
def clear_ai_history(request: Request):
    """Clear conversation history for the current user"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(401, "No authorization header")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    current_email = payload.get("sub")
    
    current_user = users.find_one({"email": current_email})
    if not current_user:
        raise HTTPException(404, "User not found")
    
    user_id = str(current_user["_id"])
    
    # Clear history for this user
    if user_id in conversation_histories:
        conversation_histories[user_id] = []
    
    return {"status": "Conversation history cleared"}

