from sqlalchemy import Column, String, Integer, DateTime, Text, Float
from app.db.database import Base
from datetime import datetime
import uuid

class VideoMetadata(Base):
    __tablename__ = "video_metadata"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    status = Column(String, default="pending") # pending, processing, completed, failed
    duration = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    query = Column(String, index=True)
    video_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
