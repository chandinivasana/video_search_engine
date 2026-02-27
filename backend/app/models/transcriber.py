import whisper
import os
from typing import List, Dict, Any
from app.core.config import settings

class Transcriber:
    def __init__(self, model_name: str = settings.WHISPER_MODEL):
        self.model_name = model_name
        self.model = None

    def load_model(self):
        if self.model is None:
            print(f"Loading Whisper model: {self.model_name}...")
            self.model = whisper.load_model(self.model_name)
            print("Model loaded successfully.")

    def transcribe(self, audio_path: str) -> List[Dict[str, Any]]:
        self.load_model()
        result = self.model.transcribe(audio_path, verbose=False)
        return result['segments']

transcriber_service = Transcriber()
