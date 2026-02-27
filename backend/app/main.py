from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Semantic Video Search Engine API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from fastapi.staticfiles import StaticFiles

# ... existing code ...

# Static files for video access
app.mount("/api/v1/data/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# API Routes
from app.api.routes import router as api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
