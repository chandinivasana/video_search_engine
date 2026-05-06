"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, FileVideo, X, PlayCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface VideoUploadProps {
  onVideoUploaded: (file: File, url: string, videoId: string) => void
  videoUrl: string | null
  onClear: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export function VideoUpload({ onVideoUploaded, videoUrl, onClear }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const performUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      setUploadProgress(0)
      setFileName(file.name)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.open("POST", `${API_BASE_URL}/upload`, true)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            const videoId = response.video_id
            setIsUploading(false)
            const url = URL.createObjectURL(file)
            onVideoUploaded(file, url, videoId)
          } else {
            console.error("Upload failed:", xhr.statusText)
            setIsUploading(false)
            alert("Upload failed. Please try again.")
          }
        }

        xhr.onerror = () => {
          console.error("Network error during upload")
          setIsUploading(false)
          alert("Network error. Please check your connection.")
        }

        xhr.send(formData)
      } catch (err) {
        console.error("Error uploading video:", err)
        setIsUploading(false)
        alert("Error uploading video.")
      }
    },
    [onVideoUploaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("video/")) {
        performUpload(file)
      }
    },
    [performUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        performUpload(file)
      }
    },
    [performUpload]
  )

  if (videoUrl) {
    return (
      <div className="flex flex-col h-full bg-black/60 rounded-3xl overflow-hidden group/player">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center">
              <PlayCircle className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-slate-300 tracking-tight truncate max-w-[200px] uppercase">
              {fileName}
            </span>
          </div>
          <button
            onClick={onClear}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
            aria-label="Remove video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 w-full relative">
          <video
            src={videoUrl}
            className="h-full w-full object-contain"
            controls
            id="video-player"
          >
            <track kind="captions" />
          </video>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex flex-col items-center justify-center h-full cursor-pointer overflow-hidden rounded-3xl border border-dashed transition-all duration-300",
        isDragging
          ? "border-blue-500/50 bg-blue-500/5"
          : "border-white/10 hover:border-blue-500/30 hover:bg-white/5",
        isUploading && "pointer-events-none"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="sr-only"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-6 px-10 w-full">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </div>
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
              <span>Ingesting Video Stream</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-[10px] text-slate-500 font-mono truncate">{fileName}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 px-10">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 border border-white/5",
              isDragging 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                : "bg-white/5 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20"
            )}
          >
            <Upload className="h-7 w-7" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-slate-200 tracking-tight uppercase">
              {isDragging ? "Release to Ingest" : "Source Media Input"}
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
              Drag & Drop Video or <span className="text-blue-400 hover:underline">Browse Storage</span>
              <br/>
              MP4, WEBM, MOV • MAX 500MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
