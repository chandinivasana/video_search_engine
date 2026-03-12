from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import shutil
import uuid
from app.core.config import settings
from app.models.transcriber import transcriber_service
from app.models.embedder import embedder_service
from app.models.vector_store import vector_store_service
from app.db.database import get_db
from app.db.models import VideoMetadata, SearchHistory
from app.worker import process_video_task
import numpy as np

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video.")
    
    video_id = str(uuid.uuid4())
    video_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.mp4")
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save metadata to DB
    video_record = VideoMetadata(
        id=video_id,
        filename=file.filename,
        status="pending"
    )
    db.add(video_record)
    db.commit()
    
    # Start processing in a background task via Celery
    process_video_task.delay(video_id)
    
    return {"status": "success", "video_id": video_id, "message": "Video uploaded and processing started"}

@router.get("/process/{video_id}")
async def process_video(video_id: str, db: Session = Depends(get_db)):
    video_record = db.query(VideoMetadata).filter(VideoMetadata.id == video_id).first()
    if not video_record:
        raise HTTPException(status_code=404, detail="Video not found.")
    
    return {"status": video_record.status, "video_id": video_id}

@router.get("/search")
async def search_video(query: str, video_id: str = None, top_k: int = 5, db: Session = Depends(get_db)):
    # Log search history
    search_record = SearchHistory(query=query, video_id=video_id)
    db.add(search_record)
    db.commit()

    # 1. Embed query
    query_embedding = embedder_service.encode([query])
    
    # 2. Search FAISS
    results = vector_store_service.search(query_embedding, top_k=top_k)
    
    # 3. Filter by video_id if provided
    if video_id:
        results = [r for r in results if r['video_id'] == video_id]
        
    return {"results": results}

@router.get("/videos")
async def list_videos(db: Session = Depends(get_db)):
    videos = db.query(VideoMetadata).order_by(VideoMetadata.created_at.desc()).all()
    return {"videos": videos}
