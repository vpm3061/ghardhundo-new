'use client'
import { useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  photos: string[]
  setPhotos: (photos: string[]) => void
  maxFiles?: number
}

export default function PhotoUpload({ photos, setPhotos, maxFiles = 15 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isSingle = maxFiles === 1

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = maxFiles - photos.length
    if (remaining <= 0) return

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    setProgress(0)
    setError('')

    const supabase = createClient()
    const newUrls: string[] = []

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      if (!file.type.startsWith('image/')) { setError('Only image files allowed'); continue }
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} is too large — max 10MB`); continue }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error: uploadErr } = await supabase.storage
        .from('property-photos')
        .upload(path, file, { cacheControl: '31536000', contentType: file.type })

      if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); continue }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('property-photos')
          .getPublicUrl(data.path)
        newUrls.push(publicUrl)
      }

      setProgress(Math.round(((i + 1) / toUpload.length) * 100))
    }

    setPhotos(isSingle ? newUrls.slice(0, 1) : [...photos, ...newUrls])
    setUploading(false)
    setProgress(0)
  }

  const remove = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(e.dataTransfer.files)
  }, [photos, maxFiles]) // eslint-disable-line

  const canUpload = photos.length < maxFiles

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        isSingle ? (
          <div className="relative w-full rounded-xl overflow-hidden"
            style={{ height: '120px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={photos[0]} alt="" className="w-full h-full object-contain" />
            <button type="button" onClick={() => remove(0)} suppressHydrationWarning
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#111827' }}>✕</button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {photos.map((url, i) => (
              <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => remove(i)} suppressHydrationWarning
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.85)', color: '#111827', fontSize: '10px' }}>✕</button>
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 text-[8px] px-1.5 py-0.5 rounded font-800"
                    style={{ background: 'rgba(124,58,237,0.9)', color: '#fff' }}>Cover</div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {canUpload && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className="rounded-xl p-5 text-center cursor-pointer transition-all select-none"
          style={{
            border: `2px dashed ${dragOver ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: dragOver ? 'rgba(124,58,237,0.05)' : 'transparent',
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-600" style={{ color: '#FB923C' }}>Uploading… {progress}%</div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FB923C, #F59E0B)' }} />
              </div>
            </div>
          ) : (
            <>
              <svg className="mx-auto mb-2" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {isSingle
                  ? 'Click or drag to upload image'
                  : <>Drag & drop or <span style={{ color: '#FB923C' }}>click to upload</span></>
                }
              </p>
              {!isSingle && (
                <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>
                  {photos.length}/{maxFiles} · JPG, PNG, WEBP · max 10MB each
                </p>
              )}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={!isSingle}
            className="sr-only"
            onChange={e => uploadFiles(e.target.files)}
            disabled={uploading}
          />
        </div>
      )}

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
          {error}
        </p>
      )}
    </div>
  )
}
