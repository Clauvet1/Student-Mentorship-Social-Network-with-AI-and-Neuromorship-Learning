from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable or use default
MONGO_URI = os.environ.get("MONGO_URI", os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))

client = MongoClient(MONGO_URI)
db = client["mentorship_db"]

users = db["users"]
messages = db["messages"]
mentorship_requests = db["mentorship_requests"]
mentorships = db["mentorships"]
