"use client"

import { Clock, FileText, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchResult {
  id: string
  transcript: string
  timestamp: number
  similarityScore: number
}

interface SearchResultsProps {
  results: SearchResult[]
  onTimestampClick: (timestamp: number) => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function SearchResults({ results, onTimestampClick }: SearchResultsProps) {
  if (results.length === 0) return null

  return (
    <div className="flex flex-col gap-6 py-2">
      {results.map((result, index) => (
        <button
          key={result.id}
          onClick={() => onTimestampClick(result.timestamp)}
          className={cn(
            "group w-full rounded-2xl border border-white/5 bg-white/5 p-5 text-left transition-all duration-300 shadow-lg",
            "hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-blue-500/5 hover:-translate-y-1",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-2.5 py-1.5 text-[11px] font-mono font-bold text-blue-300 border border-blue-500/30">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTimestamp(result.timestamp)}
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {(result.similarityScore * 100).toFixed(1)}% RELEVANCE
                </div>
              </div>
              <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                {index + 1}
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 h-8 w-8 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-[15px] leading-relaxed text-slate-300 group-hover:text-white transition-colors">
                {result.transcript}
              </p>
            </div>
            
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Click to jump to timestamp</span>
              <div className="h-px flex-1 bg-white/5 group-hover:bg-blue-500/20 transition-colors" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
