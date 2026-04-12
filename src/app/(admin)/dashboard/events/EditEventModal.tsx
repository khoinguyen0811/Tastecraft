'use client'

import { useState, useTransition, useRef } from 'react'
import { updateEvent } from './actions'
import RecipeImage from '@/components/ui/RecipeImage'

interface Event {
  id: number
  title: string
  description: string
  banner_image: string | null
  start_date: string
  end_date: string
  max_recipes_per_user: number
}

interface Props {
  event: Event
  onSuccess: (updated: Partial<Event>) => void
}

export default function EditEventModal({ event, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState(event.banner_image ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Ảnh tối đa 2MB'); return }
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.error) { setError(json.error); return }
    setBannerUrl(json.url)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('banner_image', bannerUrl)
    startTransition(async () => {
      const result = await updateEvent(event.id, fd)
      if (result.error) { setError(result.error); return }
      onSuccess({
        title: fd.get('title') as string,
        description: fd.get('description') as string,
        banner_image: bannerUrl || null,
        max_recipes_per_user: parseInt(fd.get('max_recipes_per_user') as string) || 2,
      })
      setOpen(false)
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-bold transition">
        <i className="fa fa-edit mr-1"></i> Sửa
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Chỉnh sửa sự kiện</h3>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <i className="fa fa-times"></i>
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tên sự kiện *</label>
                <input name="title" required defaultValue={event.title}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả</label>
                <textarea name="description" rows={3} defaultValue={event.description}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm resize-none" />
              </div>

              {/* Banner */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ảnh banner</label>
                <div className="flex items-center gap-4">
                  {bannerUrl ? (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0">
                      <RecipeImage src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setBannerUrl('')}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()}
                      className="w-32 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition shrink-0">
                      {uploading
                        ? <i className="fa fa-spinner fa-spin text-orange-400"></i>
                        : <><i className="fa fa-image text-gray-300 text-xl mb-1"></i><span className="text-xs text-gray-400">Tải ảnh lên</span></>
                      }
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={handleBannerUpload} disabled={uploading} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Giới hạn công thức / user</label>
                <input name="max_recipes_per_user" type="number" min={1} max={10}
                  defaultValue={event.max_recipes_per_user}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending || uploading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm">
                  {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-xl transition text-sm">
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
