"use client"

import { useState } from "react"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  disabled: boolean
}

export function SearchBar({ onSearch, isSearching, disabled }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isSearching && !disabled) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          "group relative flex items-center overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200",
          disabled
            ? "border-border opacity-60"
            : "border-border focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/5"
        )}
      >
        <div className="flex h-full items-center pl-4">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? "Upload a video first..." : "Ask something about this video..."}
          disabled={disabled}
          className="h-12 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="pr-2">
          <button
            type="submit"
            disabled={!query.trim() || isSearching || disabled}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-xl px-4 text-xs font-medium transition-all duration-200",
              !query.trim() || isSearching || disabled
                ? "bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]"
            )}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <Search className="h-3 w-3" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
