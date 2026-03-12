# AI-Powered Video Search Engine

A high-performance semantic search platform that transcribes videos using OpenAI Whisper, generates embeddings via Sentence Transformers, and enables millisecond-latency timestamp retrieval using FAISS.

## Features
- **Video Upload & Processing**: Supports video uploads with automated audio extraction using FFmpeg.
- **AI Transcription**: High-accuracy transcription using OpenAI Whisper.
- **Semantic Search**: Natural language query interface for finding specific moments.
- **Async Task Queue**: Integrated **Redis** and **Celery** for background video processing and embedding generation.
- **Persistent Storage**: **PostgreSQL** for managing video metadata and search history.
- **Vector Search**: **FAISS** integration for efficient similarity search across transcribed segments.
- **Interactive UI**: Next.js frontend with integrated video player for instant timestamp jumping.

## Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL and Redis)
- `ffmpeg` (required for Whisper audio extraction)
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

## Setup & Run

### 1. Automatic Setup
Ensure Docker is running, then use the setup script to initialize the infrastructure, backend, and frontend:
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Running the Application
The application requires three components to be running:

#### Infrastructure
Already started by `setup.sh`, but can be manually managed:
```bash
docker compose up -d
```

#### Backend API & Worker
In two separate terminals:
```bash
# Terminal 1: API Server
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Celery Worker
cd backend && source venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info
```

#### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

## Architecture
1. **Upload**: Video is stored and metadata is recorded in **PostgreSQL**.
2. **Async Processing**: A **Celery** task is triggered via **Redis**, transcribing the video with **Whisper** and generating embeddings.
3. **Indexing**: Processed segments and embeddings are stored in a **FAISS** vector store for rapid retrieval.
4. **Search**: Queries are embedded and matched against the vector store; history is persisted in PostgreSQL.
