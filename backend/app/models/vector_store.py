import faiss
import numpy as np
import os
import json
from typing import List, Dict, Any, Tuple
from app.core.config import settings

class VectorStore:
    def __init__(self, dimension: int = 384): # Default dimension for all-MiniLM-L6-v2
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata: List[Dict[str, Any]] = []

    def add(self, embeddings: np.ndarray, metadata: List[Dict[str, Any]]):
        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: {embeddings.shape[1]} != {self.dimension}")
        self.index.add(embeddings.astype('float32'))
        self.metadata.extend(metadata)

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        if query_embedding.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: {query_embedding.shape[1]} != {self.dimension}")
            
        distances, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1:
                item = self.metadata[idx].copy()
                item['score'] = float(dist)
                results.append(item)
        return results

    def save(self, path: str):
        faiss.write_index(self.index, f"{path}.index")
        with open(f"{path}.metadata.json", "w") as f:
            json.dump(self.metadata, f)

    def load(self, path: str):
        if os.path.exists(f"{path}.index"):
            self.index = faiss.read_index(f"{path}.index")
        if os.path.exists(f"{path}.metadata.json"):
            with open(f"{path}.metadata.json", "r") as f:
                self.metadata = json.load(f)

# Global store for this MVP - in production, we would use unique IDs per video
vector_store_service = VectorStore()
