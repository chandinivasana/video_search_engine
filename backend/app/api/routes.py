from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import os
import shutil
import uuid
from app.core.config import settings
from app.models.transcriber import transcriber_service
from app.models.embedder import embedder_service
from app.models.vector_store import vector_store_service
import numpy as np

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video.")
    
    video_id = str(uuid.uuid4())
    video_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.mp4")
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Start processing in a background task (or directly for MVP)
    # For now, let's just return the ID
    return {"status": "success", "video_id": video_id}

@router.get("/process/{video_id}")
async def process_video(video_id: str):
    video_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.mp4")
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found.")
    
    # 1. Transcribe (Direct call for MVP)
    # Whisper can handle video directly (extracts audio internally if ffmpeg is present)
    segments = transcriber_service.transcribe(video_path)
    
    # 2. Chunk (Whisper already provides segments, we can use them as chunks)
    # Metadata for FAISS
    metadata = []
    texts = []
    for segment in segments:
        text = segment['text'].strip()
        if text:
            texts.append(text)
            metadata.append({
                "video_id": video_id,
                "text": text,
                "start": segment['start'],
                "end": segment['end']
            })
    
    # 3. Embed
    embeddings = embedder_service.encode(texts)
    
    # 4. Store
    vector_store_service.add(embeddings, metadata)
    
    return {"status": "processed", "video_id": video_id, "segments_count": len(metadata)}

@router.get("/search")
async def search_video(query: str, video_id: str = None, top_k: int = 5):
    # 1. Embed query
    query_embedding = embedder_service.encode([query])
    
    # 2. Search FAISS
    results = vector_store_service.search(query_embedding, top_k=top_k)
    
    # 3. Filter by video_id if provided
    if video_id:
        results = [r for r in results if r['video_id'] == video_id]
        
    return {"results": results}
