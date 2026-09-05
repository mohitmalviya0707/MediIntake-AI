import os
from datetime import datetime
from pymongo import MongoClient

_client = None
_collection = None
_memory = {}


def init_db():
    global _client, _collection
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    try:
        _client = MongoClient(uri, serverSelectionTimeoutMS=700)
        _client.admin.command("ping")
        _collection = _client[os.getenv("MONGODB_DB", "mediintake")]["sessions"]
    except Exception:
        _client = None
        _collection = None


def save_session(session: dict):
    session = {**session, "updated_at": datetime.utcnow().isoformat()}
    if _collection is not None:
        _collection.replace_one({"session_id": session["session_id"]}, session, upsert=True)
    else:
        _memory[session["session_id"]] = session
    return session


def get_session(session_id: str):
    if _collection is not None:
        return _collection.find_one({"session_id": session_id}, {"_id": 0})
    return _memory.get(session_id)
