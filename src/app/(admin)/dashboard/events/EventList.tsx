'use client'

import { useState, useTransition, useRef } from 'react'
import { createEvent, toggleEventActive, deleteEvent } from './actions'
import RecipeImage from '@/components/ui/RecipeImage'
import EditEventModal from './EditEventModal'

interface Event {
  id: number
  title: string
  description: string
  banner_image: string | null
  start_date: string
  end_date: string
  is_active: boolean
  participant_count: number
  max_recipes_per_user: number
}

function EventForm({ onSuccess }: { onSuccess: (e: Event) => void }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Ảnh tối đa 2MB'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.error) { setError(json.error); return }
    setBannerUrl(json.url)
  }

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Validate phía client — tránh lệch timezone khi gửi lên server
    if (startDate && endDate && endDate <= startDate) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    const fd = new FormData(e.currentTarget)
    fd.set('banner_image', bannerUrl)
    startTransition(async () => {
      const result = await createEvent(fd)
      if (result.error) { setError(result.error); return }
      onSuccess(result.event!)
      setOpen(false)
      setBannerUrl('')
      setStartDate('')
      setEndDate('')
      ;(e.target as HTMLFormElement).reset()
    })
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2">
          <i className="fa fa-plus"></i> Tạo sự kiện mới
        </button>
      ) : (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
          <h3 className="text-lg font-bold mb-6">Tạo sự kiện / thử thách mới</h3>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tên sự kiện *</label>
              <input name="title" required placeholder="Thử thách nấu ăn mùa hè..."
                className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả</label>
              <textarea name="description" rows={3} placeholder="Mô tả chi tiết về sự kiện..."
                className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm resize-none" />
            </div>

            {/* Banner upload */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ảnh banner</label>
              <div className="flex items-center gap-4">
                {bannerUrl ? (
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={bannerUrl} className="w-full h-full object-cover" alt="banner" />
                    <button type="button" onClick={() => setBannerUrl('')}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-32 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition shrink-0">
                    {uploading
                      ? <i className="fa fa-spinner fa-spin text-orange-400"></i>
                      : <><i className="fa fa-image text-gray-300 text-xl mb-1"></i><span className="text-xs text-gray-400">Tải ảnh lên</span></>
                    }
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  <p>JPG, PNG, WEBP</p>
                  <p>Tối đa 2MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={handleBannerUpload} disabled={uploading} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Giới hạn công thức / user</label>
              <input name="max_recipes_per_user" type="number" min={1} max={10} defaultValue={2}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Mỗi user được gửi tối đa bao nhiêu công thức</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ngày bắt đầu *</label>
                <input name="start_date" type="datetime-local" required
                  value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ngày kết thúc *</label>
                <input name="end_date" type="datetime-local" required
                  value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending || uploading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">
                {isPending ? 'Đang tạo...' : 'Tạo sự kiện'}
              </button>
              <button type="button" onClick={() => { setOpen(false); setBannerUrl(''); setStartDate(''); setEndDate('') }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-xl transition text-sm">
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default function EventList({ events }: { events: Event[]; adminId: string }) {
  const [list, setList] = useState(events)
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: number, current: boolean) {
    startTransition(async () => {
      const result = await toggleEventActive(id, current)
      if (!result.error) setList(l => l.map(e => e.id === id ? { ...e, is_active: !current } : e))
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Xoá sự kiện này?')) return
    startTransition(async () => {
      const result = await deleteEvent(id)
      if (!result.error) setList(l => l.filter(e => e.id !== id))
    })
  }

  const now = new Date()

  return (
    <div>
      <EventForm onSuccess={e => setList(l => [e, ...l])} />

      {list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem]">
          <i className="fa fa-trophy text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400">Chưa có sự kiện nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(event => {
            const started = new Date(event.start_date) <= now
            const ended = new Date(event.end_date) < now
            const status = ended ? 'Đã kết thúc' : started ? 'Đang diễn ra' : 'Sắp diễn ra'
            const statusColor = ended ? 'bg-gray-100 text-gray-400' : started ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'

            return (
              <div key={event.id} className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border transition ${event.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                {event.banner_image && (
                  <div className="h-40 overflow-hidden">
                    <RecipeImage src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base">{event.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${statusColor}`}>{status}</span>
                  </div>
                  {event.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span><i className="far fa-calendar mr-1"></i>{new Date(event.start_date).toLocaleDateString('vi-VN')}</span>
                    <span>→</span>
                    <span>{new Date(event.end_date).toLocaleDateString('vi-VN')}</span>
                    <span className="ml-auto"><i className="fa fa-users mr-1"></i>{event.participant_count} tham gia</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(event.id, event.is_active)} disabled={isPending}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${event.is_active ? 'bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
                      {event.is_active ? 'Ẩn sự kiện' : 'Kích hoạt'}
                    </button>
                    <EditEventModal
                      event={event}
                      onSuccess={updated => setList(l => l.map(e => e.id === event.id ? { ...e, ...updated } : e))}
                    />
                    <a href={`/dashboard/events/${event.id}`}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition">
                      Quản lý
                    </a>
                    <button onClick={() => handleDelete(event.id)} disabled={isPending}
                      className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl text-xs font-bold transition">
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
