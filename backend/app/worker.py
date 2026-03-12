import os
from celery import Celery
from app.core.config import settings
from app.db.database import SessionLocal
from app.db.models import VideoMetadata
from app.models.transcriber import transcriber_service
from app.models.embedder import embedder_service
from app.models.vector_store import vector_store_service
import logging

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL
)

celery_app.conf.update(task_track_started=True)

logger = logging.getLogger(__name__)

@celery_app.task(name="process_video_task")
def process_video_task(video_id: str):
    logger.info(f"Starting to process video {video_id}")
    db = SessionLocal()
    video_record = db.query(VideoMetadata).filter(VideoMetadata.id == video_id).first()
    
    if not video_record:
        logger.error(f"Video {video_id} not found in DB")
        db.close()
        return {"status": "error", "message": "Video not found in DB"}

    video_record.status = "processing"
    db.commit()

    video_path = os.path.join(settings.UPLOAD_DIR, f"{video_id}.mp4")
    
    try:
        # 1. Transcribe (Direct call for MVP)
        # Whisper can handle video directly (extracts audio internally if ffmpeg is present)
        logger.info(f"Transcribing video {video_id}")
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
        logger.info(f"Embedding video {video_id} texts")
        embeddings = embedder_service.encode(texts)
        
        # 4. Store
        logger.info(f"Storing video {video_id} embeddings in vector store")
        vector_store_service.add(embeddings, metadata)
        
        # Update DB
        video_record.status = "completed"
        db.commit()
        logger.info(f"Successfully processed video {video_id}")
        return {"status": "completed", "video_id": video_id, "segments_count": len(metadata)}
        
    except Exception as e:
        logger.error(f"Error processing video {video_id}: {str(e)}")
        video_record.status = "failed"
        db.commit()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
