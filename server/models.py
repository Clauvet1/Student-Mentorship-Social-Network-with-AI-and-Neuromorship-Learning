from pydantic import BaseModel
from datetime import datetime

class Message(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime = datetime.utcnow()
