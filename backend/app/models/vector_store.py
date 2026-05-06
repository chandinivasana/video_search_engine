import faiss
import numpy as np
import os
import json
from typing import List, Dict, Any, Tuple
from app.core.config import settings

class VectorStore:
    def __init__(self, dimension: int = 384): # Default dimension for all-MiniLM-L6-v2
        self.dimension = dimension
        self.index_path = os.path.join(settings.VECTOR_DB_DIR, "faiss.index")
        self.metadata_path = os.path.join(settings.VECTOR_DB_DIR, "metadata.json")
        
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
        else:
            self.index = faiss.IndexFlatL2(dimension)
            self.metadata: List[Dict[str, Any]] = []

    def add(self, embeddings: np.ndarray, metadata: List[Dict[str, Any]]):
        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: {embeddings.shape[1]} != {self.dimension}")
        
        # Reload to get current state before adding
        self.load()
        
        self.index.add(embeddings.astype('float32'))
        self.metadata.extend(metadata)
        self.save()

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        if query_embedding.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: {query_embedding.shape[1]} != {self.dimension}")
            
        # Reload to ensure we have the latest data from the worker
        self.load()
        
        if self.index.ntotal == 0:
            return []
            
        distances, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(self.metadata):
                item = self.metadata[idx].copy()
                item['score'] = float(dist)
                results.append(item)
        return results

    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "w") as f:
            json.dump(self.metadata, f)

    def load(self):
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
            if os.path.exists(self.metadata_path):
                with open(self.metadata_path, "r") as f:
                    self.metadata = json.load(f)

# Global store for this MVP - in production, we would use unique IDs per video
vector_store_service = VectorStore()
