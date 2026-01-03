from fastapi import APIRouter
from database import messages
from models import Message

router = APIRouter(prefix="/api/messages")


@router.post("/send")
def send_message(msg: "Message"):
    result = messages.insert_one(msg.model_dump())
    saved_message = msg.model_dump()
    saved_message["_id"] = str(result.inserted_id)
    saved_message["timestamp"] = saved_message["timestamp"].isoformat()
    return saved_message


@router.get("/{user1}/{user2}")
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
