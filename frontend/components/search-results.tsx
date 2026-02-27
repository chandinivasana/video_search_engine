"use client"

import { Clock, FileText, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

function getScoreColor(score: number) {
  if (score >= 0.9) return "text-emerald-600 bg-emerald-50 border-emerald-200"
  if (score >= 0.7) return "text-blue-600 bg-blue-50 border-blue-200"
  return "text-amber-600 bg-amber-50 border-amber-200"
}

function getScoreLabel(score: number) {
  if (score >= 0.9) return "Excellent"
  if (score >= 0.7) return "Good"
  return "Fair"
}

export function SearchResults({ results, onTimestampClick }: SearchResultsProps) {
  if (results.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Search Results
        </h2>
        <span className="text-xs text-muted-foreground">
          {results.length} {results.length === 1 ? "match" : "matches"} found
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {results.map((result, index) => (
          <button
            key={result.id}
            onClick={() => onTimestampClick(result.timestamp)}
            className={cn(
              "group w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-200",
              "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors group-hover:bg-primary/15">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(result.timestamp)}
                  </div>
                  <div className={cn("flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium", getScoreColor(result.similarityScore))}>
                    <TrendingUp className="h-3 w-3" />
                    {(result.similarityScore * 100).toFixed(0)}% {getScoreLabel(result.similarityScore)}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.transcript}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
