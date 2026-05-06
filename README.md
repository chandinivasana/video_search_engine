# vide0_Engine 

A professional-grade, high-performance semantic video search platform. **vide0_Engine** leverages OpenAI Whisper for high-accuracy transcription, Sentence Transformers for neural embeddings, and FAISS for millisecond-latency vector retrieval.

## Key Features
- **Pro-Utility Dashboard**: A sleek, two-column interface designed for professional video intelligence.
- **Neural Semantic Search**: Find specific moments using natural language instead of just keywords.
- **Persistent Vector Intelligence**: High-performance FAISS vector store with on-disk persistence for durable memory.
- **AI Transcription**: Automated speech-to-text pipeline using OpenAI Whisper.
- **Asynchronous Processing**: Integrated **Redis** and **Celery** for background ingestion and neural indexing.
- **Integrated Video Player**: Instant timestamp jumping directly from semantic search results.
- **Ethereal Aesthetic**: Modern glassmorphic UI with organic motion backgrounds.

##  Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **FFmpeg** (required for audio extraction)
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

## Setup & Execution

### 1. Automatic Initialization
Ensure Docker is running, then execute the setup script to prepare the environment:
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Launching the Platform
The platform requires three core components running in parallel:

#### Infrastructure
```bash
docker compose up -d
```

#### Neural API Server
```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --reload
```

#### AI Worker (Processing Engine)
> **Note for macOS users**: To avoid fork safety conflicts with AI libraries, use the `OBJC_DISABLE_INITIALIZE_FORK_SAFETY` flag.
```bash
cd backend && source venv/bin/activate
OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES celery -A app.worker.celery_app worker --loglevel=info
```

#### Pro Dashboard (Frontend)
```bash
cd frontend
npm run dev
```

##  Architecture
1. **Ingestion**: Videos are uploaded to local storage, and metadata is persisted in **PostgreSQL**.
2. **Neural Pipeline**: **Celery** triggers a background task that uses **Whisper** to transcribe audio and **Sentence Transformers** to generate 384-dimensional embeddings.
3. **Persistent Indexing**: Neural segments are stored in a persistent **FAISS** index, allowing for sub-millisecond similarity matching across large video libraries.
4. **Semantic Retrieval**: Queries are embedded into the same vector space, and the closest semantic matches are returned as interactive "Reply" cards in the UI.


