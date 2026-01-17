from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from database import messages, mentorship_requests, mentorships
from models import Message, UserResponse, MentorshipRequest, Mentorship  # Import Message class
from database import users
from models import User
from authentication import hash_password, verify_password, create_token, verify_token
router = APIRouter(prefix="/api")


@router.post("/messages/send")
def send_message(msg: Message):  # REMOVED THE QUOTES AROUND Message
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

    token = create_token({"sub": db_user["email"]})
    return {"token": token}


@router.get("/users", response_model=list[UserResponse])
def get_users():
    all_users = list(users.find({}, {"password": 0}))
    user_list = []
    for user in all_users:
        user["_id"] = str(user["_id"])
        user_list.append(user)
    return user_list


@router.get("/users/{user_id}")
def get_user_by_id(user_id: str):
    """Get a specific user by ID"""
    from bson import ObjectId
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
            "bio": mentor.get("bio", "")
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
    
    if current_user.get("role") != "mentee":
        raise HTTPException(403, "Only mentees can request mentorship")
    
    # Check if mentor exists
    mentor = users.find_one({"_id": mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(404, "Mentor not found")
    
    # Check if request already exists
    existing = mentorship_requests.find_one({
        "mentor_id": mentor_id,
        "mentee_id": str(current_user["_id"]),
        "status": {"$in": ["pending", "accepted"]}
    })
    if existing:
        raise HTTPException(400, "Mentorship request already exists")
    
    # Create request
    mentorship_requests.insert_one({
        "mentor_id": mentor_id,
        "mentee_id": str(current_user["_id"]),
        "mentee_name": current_user["name"],
        "mentee_email": current_user["email"],
        "status": "pending",
        "created_at": datetime.utcnow()
    })
    
    return {"status": "Mentorship request sent"}


@router.get("/my-requests")
def get_my_requests(request: Request):
    """Get mentorship requests for the current user (mentors see requests, mentees see their requests)"""
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
        # Mentor sees requests sent to them
        user_requests = list(mentorship_requests.find({
            "mentor_id": current_user_id,
            "status": "pending"
        }))
    else:
        # Mentee sees their sent requests
        user_requests = list(mentorship_requests.find({
            "mentee_id": current_user_id
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
    
    # Find the request
    req = mentorship_requests.find_one({"_id": request_id})
    if not req:
        raise HTTPException(404, "Request not found")
    
    if req["mentor_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Not authorized to accept this request")
    
    if req["status"] != "pending":
        raise HTTPException(400, "Request already processed")
    
    # Update request status
    mentorship_requests.update_one(
        {"_id": request_id},
        {"$set": {"status": "accepted"}}
    )
    
    # Create mentorship relationship
    mentorships.insert_one({
        "mentor_id": req["mentor_id"],
        "mentee_id": req["mentee_id"],
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
    
    # Find the request
    req = mentorship_requests.find_one({"_id": request_id})
    if not req:
        raise HTTPException(404, "Request not found")
    
    if req["mentor_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Not authorized to reject this request")
    
    # Update request status
    mentorship_requests.update_one(
        {"_id": request_id},
        {"$set": {"status": "rejected"}}
    )
    
    return {"status": "Request rejected"}


@router.get("/my-mentors")
def get_my_mentors(request: Request):
    """Get list of mentors for the current mentee"""
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
    user_mentorships = list(mentorships.find({"mentee_id": current_user_id}))
    
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


@router.get("/my-mentees")
def get_my_mentees(request: Request):
    """Get list of mentees for the current mentor"""
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
    user_mentorships = list(mentorships.find({"mentor_id": current_user_id}))
    
    mentee_list = []
    for ms in user_mentorships:
        mentee = users.find_one({"_id": ms["mentee_id"]})
        if mentee:
            mentee_list.append({
                "_id": str(mentee["_id"]),
                "name": mentee["name"],
                "email": mentee["email"],
                "role": mentee["role"]
            })
    
    return mentee_list


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
    
    if user_role == "mentor":
        # Get all mentees
        user_mentorships = list(mentorships.find({"mentor_id": current_user_id}))
        partner_field = "mentee_id"
    else:
        # Get all mentors
        user_mentorships = list(mentorships.find({"mentee_id": current_user_id}))
        partner_field = "mentor_id"
    
    partner_list = []
    for ms in user_mentorships:
        partner = users.find_one({"_id": ms[partner_field]})
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
