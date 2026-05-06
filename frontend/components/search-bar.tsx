"use client"

import { useState } from "react"
import { Search, Loader2, Command } from "lucide-react"
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
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={cn(
          "group relative flex items-center overflow-hidden rounded-xl transition-all duration-300",
          disabled
            ? "bg-transparent opacity-40 cursor-not-allowed"
            : "bg-black/20 focus-within:bg-black/40 border border-white/5 focus-within:border-blue-500/50"
        )}
      >
        <div className="flex h-12 items-center pl-4 pr-3">
          <Search className={cn(
            "h-4 w-4 transition-colors",
            disabled ? "text-slate-600" : "text-slate-500 group-focus-within:text-blue-400"
          )} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? "Systems initializing..." : "Search through your video library with natural language..."}
          disabled={disabled}
          className="h-12 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:cursor-not-allowed font-medium"
        />
        <div className="flex items-center gap-3 pr-3">
          {!isSearching && !disabled && (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-slate-500 font-bold tracking-tighter uppercase">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          )}
          <button
            type="submit"
            disabled={!query.trim() || isSearching || disabled}
            className={cn(
              "flex h-8 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all duration-300 uppercase tracking-widest",
              !query.trim() || isSearching || disabled
                ? "bg-white/5 text-slate-600"
                : "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
