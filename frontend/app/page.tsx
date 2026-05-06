"use client"

import { useState, useCallback } from "react"
import { Search, Clock, History, FileText, TrendingUp, LayoutDashboard, Database, Activity, Command, Trash2 } from "lucide-react"
import { VideoUpload } from "@/components/video-upload"
import { SearchBar } from "@/components/search-bar"
import { SearchResults, type SearchResult } from "@/components/search-results"
import { IndexingOverlay, EmptyState, ErrorState } from "@/components/states"
import { EtherealShadow } from "@/components/ui/etheral-shadow"
import { cn } from "@/lib/utils"

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

  // Search history state
  const [searchHistory, setSearchHistory] = useState([
    { id: "1", query: "Find the part about Q4 revenue", time: "2h ago" },
    { id: "2", query: "Explain the FAISS indexing", time: "5h ago" },
    { id: "3", query: "When is the model trained?", time: "1d ago" },
  ])

  const deleteHistoryItem = (id: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id))
  }

  const clearAllHistory = () => {
    setSearchHistory([])
  }

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

  const handleSearch = useCallback(async (query: string, skipHistory = false) => {
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
      
      const mappedResults: SearchResult[] = data.results.map((item: any, index: number) => ({
        id: index.toString(),
        transcript: item.text,
        timestamp: item.start,
        similarityScore: Math.max(0, Math.min(1, 1 - (item.score / 2))), 
      }))

      setResults(mappedResults)
      
      if (!skipHistory) {
        setSearchHistory(prev => {
          // Check if query already exists to avoid duplicates
          const exists = prev.find(item => item.query.toLowerCase() === query.toLowerCase())
          if (exists) return prev
          
          const newHistoryItem = {
            id: Date.now().toString(),
            query: query,
            time: "Just now"
          }
          return [newHistoryItem, ...prev].slice(0, 10)
        })
      }
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
    <EtherealShadow 
      color="rgba(0, 0, 0, 1)" 
      animation={{ scale: 90, speed: 20 }}
      noise={{ opacity: 0.1, scale: 1.2 }}
    >
      <div className="flex flex-col h-screen max-w-[1500px] mx-auto p-4 md:p-8 gap-6 text-slate-50 overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none italic">vide0_Engine</h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mt-1">Neural Vector Intelligence</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Core Engine</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational</span>
              </div>
            </div>
          </div>
        </header>

        {/* Search Bar Section */}
        <section className="shrink-0">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl ring-1 ring-white/5">
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={!isIndexed || isIndexing}
            />
          </div>
        </section>

        {/* Main Application Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
          
          {/* Left Column: Media Processing */}
          <div className="flex flex-col gap-6 min-h-0">
            <div className="flex-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-[2rem] overflow-hidden relative group shadow-2xl ring-1 ring-white/5 flex flex-col">
              <div className="flex-1 min-h-0">
                <VideoUpload
                  onVideoUploaded={handleVideoUploaded}
                  videoUrl={videoUrl}
                  onClear={handleClear}
                />
              </div>
              
              {videoId && isIndexed && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl z-20 shadow-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <Activity className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Active Index</p>
                      <p className="text-[9px] font-mono text-slate-500 truncate max-w-[200px]">{videoId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-tighter">FAISS SYNCED</span>
                  </div>
                </div>
              )}
            </div>
            
            {(isIndexing || error) && (
              <div className="shrink-0 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isIndexing && (
                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-xl ring-1 ring-blue-500/10">
                    <IndexingOverlay isIndexing={isIndexing} />
                  </div>
                )}
                {error && (
                  <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-2 backdrop-blur-xl">
                    <ErrorState message={error} onRetry={handleRetry} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: AI Response Pane */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-slate-100 uppercase italic">Neural Response</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Contextual segment extraction</p>
                </div>
              </div>
              {results.length > 0 && (
                <div className="px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <span className="text-[10px] font-mono font-bold text-blue-400 tracking-tighter">
                    {results.length} SEGMENTS FOUND
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
              {isSearching ? (
                <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                  <div className="relative">
                    <div className="h-24 w-24 animate-[spin_3s_linear_infinite] rounded-full border-[6px] border-blue-500/10 border-t-blue-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 animate-pulse flex items-center justify-center">
                        <Database className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <span className="text-sm font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">Computing Inference</span>
                    <p className="text-[10px] text-slate-500 font-mono uppercase max-w-[200px] leading-relaxed mx-auto">Searching vector space for semantic similarities...</p>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6 pb-6">
                  <SearchResults
                    results={results}
                    onTimestampClick={handleTimestampClick}
                  />
                </div>
              ) : hasSearched ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 text-center animate-in zoom-in-95 duration-500">
                  <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 rotate-3">
                    <History className="h-12 w-12 text-slate-600" />
                  </div>
                  <p className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">Zero matches</p>
                  <p className="text-[10px] mt-2 text-slate-600 uppercase tracking-widest font-mono">Input signal does not correlate with known data</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30 group/idle">
                  <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover/idle:scale-105 duration-700">
                    <LayoutDashboard className="h-16 w-16 text-slate-400 group-hover/idle:text-blue-400/50 transition-colors duration-700" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tight mb-4 italic">Ready for Input</h4>
                  <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed uppercase tracking-widest font-medium mx-auto">
                    Awaiting video ingestion and neural query initialization
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="flex items-center justify-between px-8 py-4 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <Database className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">SQL_DB: PERSISTENT</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">FAISS_CORE: OPTIMIZED</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 shadow-inner">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black">v1.0.6-PRO-DISTRIBUTION</span>
          </div>
        </footer>
      </div>
    </EtherealShadow>
  )
}
  )
}
