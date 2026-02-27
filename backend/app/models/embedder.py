from sentence_transformers import SentenceTransformer
import torch
import numpy as np
from typing import List, Union
from app.core.config import settings

class Embedder:
    def __init__(self, model_name: str = settings.EMBEDDING_MODEL):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None

    def load_model(self):
        if self.model is None:
            print(f"Loading Embedding model: {self.model_name} on {self.device}...")
            self.model = SentenceTransformer(self.model_name, device=self.device)
            print("Model loaded successfully.")

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        self.load_model()
        return self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

embedder_service = Embedder()
