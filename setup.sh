#!/bin/bash

# Setup Database and Redis
echo "Starting PostgreSQL and Redis..."
docker compose up -d

# Setup Backend
echo "Setting up backend..."
cd backend
rm -rf venv  # Ensure a fresh start
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cd ..

# Setup Frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "Setup complete! To run the project:"
echo "1. Backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "2. Celery Worker: cd backend && source venv/bin/activate && celery -A app.worker.celery_app worker --loglevel=info"
echo "3. Frontend: cd frontend && npm run dev"
