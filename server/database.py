from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mentorship_db"]

users = db["users"]
messages = db["messages"]
mentorship_requests = db["mentorship_requests"]
mentorships = db["mentorships"]
