import { Search } from "lucide-react"
import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Semantic Video Search
            </h1>
            <p className="text-xs text-muted-foreground">
              Search inside videos using AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <Search className="h-3 w-3" />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </header>
  )
}
