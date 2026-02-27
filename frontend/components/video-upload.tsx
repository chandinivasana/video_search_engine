"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, FileVideo, X } from "lucide-react"
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
          alert("Network error. Please check your connection and ensure the backend is running.")
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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FileVideo className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{fileName}</span>
          </div>
          <button
            onClick={onClear}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Remove video"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="aspect-video w-full bg-foreground/5">
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
        "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/40 hover:bg-accent/50",
        isUploading && "pointer-events-none"
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload video file"
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
        aria-label="Choose video file"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileVideo className="h-6 w-6 text-primary" />
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Uploading video...</span>
              <span className="text-muted-foreground">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="mt-2 text-center text-xs text-muted-foreground">{fileName}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-12">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200",
              isDragging ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}
          >
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop your video here" : "Drop a video file or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports MP4, WebM, MOV up to 500MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
