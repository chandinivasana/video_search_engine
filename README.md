# Semantic Video Search Engine

A full-stack application for searching inside videos using AI (Whisper for transcription and Sentence Transformers for semantic search).

## Features
- **Video Upload**: Upload video files for processing.
- **AI Transcription**: Automatic transcription using OpenAI Whisper.
- **Semantic Search**: Search for specific moments using natural language.
- **Video Player Integration**: Jump directly to the relevant moment in the video.

## Prerequisites
- Python 3.9+
- Node.js 18+
- `ffmpeg` (required for Whisper audio extraction)
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

## Setup & Run

### 1. Automatic Setup
Use the provided setup script to initialize both backend and frontend:
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Manual Run

#### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```
The backend will be available at `http://localhost:8000`.

#### Frontend (Next.js)
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## How it works
1. **Upload**: The video is uploaded to the backend.
2. **Process**: The backend transcribes the video into segments using Whisper and generates semantic embeddings for each segment.
3. **Search**: When you search, your query is embedded and compared against the video segments using FAISS (Vector DB).
4. **Result**: The most relevant moments are shown with timestamps, allowing you to click and play from that point.
