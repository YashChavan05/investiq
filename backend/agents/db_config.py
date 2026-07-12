import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "investiq_db")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False

db_connection = MongoDB()

async def _try_connect(url: str) -> bool:
    """Attempt a single connection + ping. Returns True on success."""
    try:
        client = AsyncIOMotorClient(
            url,
            serverSelectionTimeoutMS=4000,
            connectTimeoutMS=4000,
        )
        await client.admin.command("ping")
        db_connection.client = client
        db_connection.db = client[DB_NAME]
        db_connection.is_connected = True
        return True
    except Exception as e:
        print(f"⚠️  MongoDB ping failed ({url[:40]}...): {e}")
        return False

async def connect_to_mongo():
    """
    Try the configured MONGO_URL first.
    If that fails, fall back to localhost:27017.
    Logs clearly and continues in degraded mode if both fail.
    """
    # Primary: configured URL
    if await _try_connect(MONGO_URL):
        print(f"✅ Connected to MongoDB at: {MONGO_URL}")
        return

    # Fallback: local MongoDB (useful when Atlas is unreachable)
    if MONGO_URL != "mongodb://localhost:27017":
        print("   Trying local MongoDB fallback (localhost:27017)...")
        if await _try_connect("mongodb://localhost:27017"):
            print("✅ Connected to local MongoDB at: mongodb://localhost:27017")
            return

    # Both failed
    db_connection.is_connected = False
    db_connection.db = None
    print("❌ All MongoDB connection attempts failed.")
    print("   History/portfolio features will be unavailable.")
    print("   Fix options:")
    print("   1. Resume your Atlas cluster at https://cloud.mongodb.com")
    print("   2. Run local MongoDB: docker run -d -p 27017:27017 mongo:7")

async def reconnect_if_needed():
    """Call this lazily before any DB operation to retry a failed connection."""
    if db_connection.is_connected:
        return db_connection.db
    await connect_to_mongo()
    return db_connection.db

async def close_mongo_connection():
    if db_connection.client:
        db_connection.client.close()
        print("🛑 MongoDB connection closed")

def get_database():
    return db_connection.db
