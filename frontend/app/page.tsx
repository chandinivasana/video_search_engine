"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { VideoUpload } from "@/components/video-upload"
import { SearchBar } from "@/components/search-bar"
import { SearchResults, type SearchResult } from "@/components/search-results"
import { IndexingOverlay, EmptyState, ErrorState } from "@/components/states"

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "1",
    transcript:
      "Machine learning models are trained on large datasets to recognize patterns and make predictions. The key is to ensure the training data is representative of real-world scenarios.",
    timestamp: 42,
    similarityScore: 0.95,
  },
  {
    id: "2",
    transcript:
      "Neural networks consist of layers of interconnected nodes that process information in a way inspired by the human brain. Deep learning uses many such layers.",
    timestamp: 127,
    similarityScore: 0.87,
  },
  {
    id: "3",
    transcript:
      "Transfer learning allows you to take a pre-trained model and fine-tune it for your specific task, saving significant time and computational resources.",
    timestamp: 234,
    similarityScore: 0.78,
  },
  {
    id: "4",
    transcript:
      "The attention mechanism in transformer models allows the network to focus on relevant parts of the input sequence, which has revolutionized natural language processing.",
    timestamp: 310,
    similarityScore: 0.72,
  },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export default function SemanticVideoSearch() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isIndexing, setIsIndexing] = useState(false)
  const [isIndexed, setIsIndexed] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVideoUploaded = useCallback(async (file: File, url: string, vidId: string) => {
    setVideoUrl(url)
    setVideoId(vidId)
    setResults([])
    setHasSearched(false)
    setError(null)
    setIsIndexing(true)

    try {
      const response = await fetch(`${API_BASE_URL}/process/${vidId}`)
      if (!response.ok) {
        throw new Error("Failed to process video.")
      }
      setIsIndexing(false)
      setIsIndexed(true)
    } catch (err) {
      console.error("Error processing video:", err)
      setError("Failed to process video. Please check your backend connection.")
      setIsIndexing(false)
    }
  }, [])

  const handleClear = useCallback(() => {
    setVideoUrl(null)
    setVideoId(null)
    setIsIndexing(false)
    setIsIndexed(false)
    setResults([])
    setHasSearched(false)
    setError(null)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    if (!videoId) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&video_id=${videoId}`)
      if (!response.ok) {
        throw new Error("Search failed.")
      }
      const data = await response.json()
      
      // Map backend results to SearchResult type
      const mappedResults: SearchResult[] = data.results.map((item: any, index: number) => ({
        id: index.toString(),
        transcript: item.text,
        timestamp: item.start,
        // Since backend L2 distance is lower = better, we do a simple inverse for visual score
        // This is just for demonstration, actual similarity mapping depends on model properties
        similarityScore: Math.max(0, Math.min(1, 1 - (item.score / 2))), 
      }))

      setResults(mappedResults)
    } catch (err) {
      console.error("Search error:", err)
      setError("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }, [videoId])

  const handleTimestampClick = useCallback((timestamp: number) => {
    const videoEl = document.getElementById("video-player") as HTMLVideoElement
    if (videoEl) {
      videoEl.currentTime = timestamp
      videoEl.play()
      videoEl.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Video Upload / Player */}
          <section aria-label="Video upload">
            <VideoUpload
              onVideoUploaded={handleVideoUploaded}
              videoUrl={videoUrl}
              onClear={handleClear}
            />
          </section>

          {/* Indexing State */}
          {isIndexing && (
            <section aria-label="Video indexing progress">
              <IndexingOverlay isIndexing={isIndexing} />
            </section>
          )}

          {/* Search Bar */}
          <section aria-label="Search">
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={!isIndexed || isIndexing}
            />
          </section>

          {/* Error State */}
          {error && (
            <section aria-label="Error">
              <ErrorState message={error} onRetry={handleRetry} />
            </section>
          )}

          {/* Results */}
          <section aria-label="Search results">
            {results.length > 0 ? (
              <SearchResults
                results={results}
                onTimestampClick={handleTimestampClick}
              />
            ) : (
              !isIndexing && !isSearching && !error && <EmptyState />
            )}
          </section>

          {/* Searching Indicator */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-5 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium text-primary">Searching through video...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-center text-xs text-muted-foreground">
            Powered by AI semantic search. Results are ranked by relevance.
          </p>
        </div>
      </footer>
    </div>
  )
}
