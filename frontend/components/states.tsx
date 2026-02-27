"use client"

import { Loader2, Brain, FileSearch } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface IndexingOverlayProps {
  isIndexing: boolean
}

export function IndexingOverlay({ isIndexing }: IndexingOverlayProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Extracting audio...")

  useEffect(() => {
    if (!isIndexing) {
      setProgress(0)
      setStage("Extracting audio...")
      return
    }

    const stages = [
      { text: "Extracting audio...", max: 25 },
      { text: "Transcribing speech...", max: 55 },
      { text: "Generating embeddings...", max: 85 },
      { text: "Building search index...", max: 100 },
    ]

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 3 + 1
      if (currentProgress >= 100) currentProgress = 100

      setProgress(currentProgress)

      const currentStage = stages.find((s) => currentProgress <= s.max)
      if (currentStage) {
        setStage(currentStage.text)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [isIndexing])

  if (!isIndexing) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
      <div className="flex flex-col items-center gap-4 px-6 py-8">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm ring-2 ring-primary/20">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-foreground">Indexing Video</h3>
          <p className="mt-1 text-xs text-muted-foreground">{stage}</p>
        </div>
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-1.5" />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <FileSearch className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">No results yet</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Upload a video and ask a question to search through its content using AI-powered semantic search.
        </p>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/5">
      <div className="flex flex-col items-center gap-3 px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <span className="text-lg text-destructive" aria-hidden="true">!</span>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-foreground">Something went wrong</h3>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 rounded-lg bg-secondary px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
