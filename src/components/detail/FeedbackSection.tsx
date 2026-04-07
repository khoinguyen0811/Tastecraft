'use client'

import { useState, useTransition, useRef } from 'react'
import { createFeedback } from '@/app/recipes/[slug]/feedbackActions'
import { RecipeFeedback } from '@/types'
import Avatar from '@/components/ui/Avatar'

interface Props {
  recipeId: number
  slug: string
  feedbacks: RecipeFeedback[]
  isLoggedIn: boolean
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <i className={`fa fa-star ${(hover || value) >= star ? 'text-orange-400' : 'text-gray-200'}`}></i>
        </button>
      ))}
    </div>
  )
}

function FeedbackCard({ fb }: { fb: RecipeFeedback }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm break-inside-avoid mb-6">
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={fb.users.avatar} name={fb.users.username} size="w-9 h-9" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm truncate">{fb.users.username}</p>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(fb.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex gap-0.5 mt-0.5">
            {[1,2,3,4,5].map(s => (
              <i key={s} className={`fa fa-star text-xs ${fb.rating >= s ? 'text-orange-400' : 'text-gray-200'}`}></i>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{fb.content}</p>
      {fb.result_image && (
        <div className="mt-4 rounded-xl overflow-hidden">
          <img src={fb.result_image} className="w-full object-cover" alt="Kết quả"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      )}
    </div>
  )
}

export default function FeedbackSection({ recipeId, slug, feedbacks, isLoggedIn }: Props) {
  const [rating, setRating] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const avgRating = feedbacks.length
    ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
    : 0

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
    setImageUrl(json.url)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('rating', String(rating))
    fd.set('recipeId', String(recipeId))
    fd.set('slug', slug)
    if (imageUrl) fd.set('result_image', imageUrl)

    startTransition(async () => {
      const result = await createFeedback(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setRating(0)
        setImageUrl('')
        formRef.current?.reset()
      }
    })
  }

  return (
    <section className="mt-24">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-1">Đánh giá từ cộng đồng</h2>
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <i key={s} className={`fa fa-star text-sm ${avgRating >= s ? 'text-orange-400' : 'text-gray-200'}`}></i>
                ))}
              </div>
              <span className="font-bold text-orange-500">{avgRating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({feedbacks.length} đánh giá)</span>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách feedback */}
      {feedbacks.length === 0 ? (
        <p className="text-gray-400 text-sm mb-12">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 mb-16">
          {feedbacks.map(fb => <FeedbackCard key={fb.id} fb={fb} />)}
        </div>
      )}

      {/* Form tạo feedback */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm max-w-2xl">
        <h3 className="text-xl font-bold mb-6">Chia sẻ trải nghiệm của bạn</h3>

        {!isLoggedIn ? (
          <p className="text-gray-500 text-sm">
            <a href="/login" className="text-orange-500 font-bold hover:underline">Đăng nhập</a> để gửi đánh giá.
          </p>
        ) : success ? (
          <div className="flex items-center gap-3 text-green-600">
            <i className="fa fa-check-circle text-xl"></i>
            <p className="font-medium">Cảm ơn bạn đã đánh giá!</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
              <textarea
                name="content"
                rows={4}
                required
                placeholder="Bạn cảm thấy thế nào về công thức này?"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh kết quả <span className="text-gray-400 font-normal">(tuỳ chọn, tối đa 2MB)</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl transition">
                  <i className="fa fa-camera mr-2"></i>
                  {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {imageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={imageUrl} className="w-full h-full object-cover" alt="preview" />
                    <button type="button" onClick={() => setImageUrl('')}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm"><i className="fa fa-exclamation-circle mr-1"></i>{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || uploading || rating === 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              {isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
