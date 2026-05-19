import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "investiq_db")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_connection = MongoDB()

async def connect_to_mongo():
    db_connection.client = AsyncIOMotorClient(MONGO_URL)
    db_connection.db = db_connection.client[DB_NAME]
    print(f"✅ Connected to MongoDB at: {MONGO_URL}")

async def close_mongo_connection():
    db_connection.client.close()
    print("🛑 MongoDB connection closed")

def get_database():
    return db_connection.db
