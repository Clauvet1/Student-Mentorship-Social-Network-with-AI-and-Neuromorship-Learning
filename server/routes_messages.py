from fastapi import APIRouter
from database import messages
from models import Message

router = APIRouter(prefix="/api/messages")

@router.post("/send")
def send_message(msg: Message):
    messages.insert_one(msg.dict())
    return {"status": "Message sent"}

@router.get("/{user1}/{user2}")
def get_messages(user1: str, user2: str):
    chat = messages.find({
        "$or": [
            {"sender_id": user1, "receiver_id": user2},
            {"sender_id": user2, "receiver_id": user1}
        ]
    }).sort("timestamp", 1)

    return list(chat)
