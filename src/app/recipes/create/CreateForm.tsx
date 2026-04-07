'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createRecipe } from './actions'
import RecipeImage from '@/components/ui/RecipeImage'

interface Ingredient { name: string; qty: string }
interface Step { content: string; note: string; image: string; uploading: boolean }

export default function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event') ? Number(searchParams.get('event')) : null
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverRef = useRef<HTMLInputElement>(null)

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', qty: '' },
  ])
  const [steps, setSteps] = useState<Step[]>([
    { content: '', note: '', image: '', uploading: false },
  ])

  // Upload helper
  async function uploadFile(file: File): Promise<string | null> {
    if (file.size > 2 * 1024 * 1024) { setError('Ảnh tối đa 2MB'); return null }
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    return json.error ? null : json.url
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCoverUploading(true)
    const url = await uploadFile(file)
    setCoverUploading(false)
    if (url) setCoverUrl(url)
  }

  async function handleStepImageUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setSteps(s => s.map((st, i) => i === idx ? { ...st, uploading: true } : st))
    const url = await uploadFile(file)
    setSteps(s => s.map((st, i) => i === idx ? { ...st, image: url ?? '', uploading: false } : st))
  }

  function addIngredient() {
    setIngredients(s => [...s, { name: '', qty: '' }])
  }
  function removeIngredient(i: number) {
    setIngredients(s => s.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, field: keyof Ingredient, val: string) {
    setIngredients(s => s.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing))
  }

  function addStep() {
    setSteps(s => [...s, { content: '', note: '', image: '', uploading: false }])
  }
  function removeStep(i: number) {
    setSteps(s => s.filter((_, idx) => idx !== i))
  }
  function updateStep(i: number, field: keyof Omit<Step, 'uploading'>, val: string) {
    setSteps(s => s.map((st, idx) => idx === i ? { ...st, [field]: val } : st))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget

    const payload = {
      title: (form.querySelector('[name=title]') as HTMLInputElement)?.value ?? '',
      description: (form.querySelector('[name=description]') as HTMLTextAreaElement)?.value ?? '',
      cooking_time: parseInt((form.querySelector('[name=cooking_time]') as HTMLInputElement)?.value) || 30,
      servings: parseInt((form.querySelector('[name=servings]') as HTMLInputElement)?.value) || 2,
      difficulty: (form.querySelector('[name=difficulty]') as HTMLSelectElement)?.value ?? '1',
      image_main: coverUrl,
      event_id: eventId,
      ingredients,
      steps: steps.map(s => ({ content: s.content, note: s.note, image: s.image })),
    }

    startTransition(async () => {
      const result = await createRecipe(payload)
      if (result?.error) {
        setError(result.error)
      } else if (result?.slug) {
        // Nếu tạo trong event → redirect về trang event
        router.push(eventId ? `/events/${eventId}` : `/recipes/${result.slug}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT — cover image */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 relative group cursor-pointer h-[420px] overflow-hidden"
            onClick={() => coverRef.current?.click()}
          >
            {coverUrl ? (
              <RecipeImage src={coverUrl} alt="cover" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
                <i className="fa fa-image text-5xl text-gray-300"></i>
              </div>
            )}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 text-center shadow-lg">
              <i className="fa fa-camera text-2xl text-orange-500 mb-2"></i>
              <h4 className="font-bold text-gray-800 mb-1">
                {coverUploading ? 'Đang tải...' : coverUrl ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
              </h4>
              <p className="text-xs text-gray-500">Ảnh JPG/PNG, tối đa 2MB</p>
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-orange-600 font-bold mb-3">
              <i className="far fa-lightbulb"></i>
              <span>Mẹo nhỏ</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dùng ánh sáng tự nhiên và góc chụp từ trên xuống (flat-lay) để ảnh món ăn thêm hấp dẫn.
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="lg:col-span-8 space-y-10">

          {/* Thông tin cơ bản */}
          <section className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên món ăn *</label>
              <input
                name="title" required
                placeholder="Ví dụ: Salad Địa Trung Hải với Sốt Chanh Dây"
                className="w-full bg-white rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-orange-200 outline-none text-lg font-medium placeholder-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giới thiệu ngắn</label>
              <textarea
                name="description" rows={3}
                placeholder="Chia sẻ câu chuyện hoặc hương vị đặc trưng..."
                className="w-full bg-white rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-orange-200 outline-none resize-none placeholder-gray-300"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  <i className="far fa-clock mr-1"></i> Thời gian (phút)
                </span>
                <input name="cooking_time" type="number" min={1} defaultValue={30}
                  className="w-full bg-transparent outline-none font-bold text-gray-800" />
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  <i className="fa fa-utensils mr-1"></i> Khẩu phần (người)
                </span>
                <input name="servings" type="number" min={1} defaultValue={2}
                  className="w-full bg-transparent outline-none font-bold text-gray-800" />
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm relative">
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  <i className="fa fa-signal mr-1"></i> Độ khó
                </span>
                <select name="difficulty" defaultValue="1"
                  className="w-full bg-transparent outline-none font-bold text-gray-800 appearance-none cursor-pointer">
                  <option value="1">Dễ</option>
                  <option value="2">Trung bình</option>
                  <option value="3">Khó</option>
                </select>
                <i className="fa fa-chevron-down absolute right-4 bottom-4 text-gray-400 text-xs pointer-events-none"></i>
              </div>
            </div>
          </section>

          {/* Nguyên liệu */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nguyên liệu</h3>
              <button type="button" onClick={addIngredient}
                className="text-orange-500 font-medium text-sm hover:text-orange-600 transition">
                <i className="fa fa-plus-circle mr-1"></i> Thêm dòng
              </button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={ing.name}
                    onChange={e => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Tên nguyên liệu"
                    className="flex-1 bg-white rounded-xl px-5 py-3 shadow-sm outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <input
                    value={ing.qty}
                    onChange={e => updateIngredient(i, 'qty', e.target.value)}
                    placeholder="Định lượng"
                    className="w-32 bg-white rounded-xl px-5 py-3 shadow-sm outline-none text-center focus:ring-2 focus:ring-orange-200"
                  />
                  <button type="button" onClick={() => removeIngredient(i)}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 transition">
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Các bước */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Các bước thực hiện</h3>
              <button type="button" onClick={addStep}
                className="text-orange-500 font-medium text-sm hover:text-orange-600 transition">
                <i className="fa fa-list-ol mr-1"></i> Thêm bước
              </button>
            </div>

            <div className="relative pl-6 ml-4 border-l-2 border-gray-200 space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[45px] top-0 w-10 h-10 bg-orange-400 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-4 border-[#f8f8f8]">
                    {i + 1}
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">Bước {i + 1}</span>
                      {steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)}
                          className="text-gray-300 hover:text-red-500 transition text-sm">
                          <i className="far fa-trash-alt"></i>
                        </button>
                      )}
                    </div>

                    <textarea
                      value={step.content}
                      onChange={e => updateStep(i, 'content', e.target.value)}
                      rows={3}
                      placeholder="Mô tả cách thực hiện bước này..."
                      className="w-full bg-transparent outline-none text-gray-700 text-sm resize-none placeholder-gray-300 mb-3"
                    />

                    {/* Note */}
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fa fa-lightbulb text-amber-400 text-xs"></i>
                        <span className="text-xs font-medium text-amber-600">Ghi chú (tuỳ chọn)</span>
                      </div>
                      <input
                        value={step.note}
                        onChange={e => updateStep(i, 'note', e.target.value)}
                        placeholder="Vd: Nhỏ lửa để tránh cháy, thêm muối vừa ăn..."
                        className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700 placeholder-amber-300 outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    {/* Step image */}
                    <div className="mt-4">
                      {step.image ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                          <img src={step.image} className="w-full h-full object-cover" alt="step" />
                          <button type="button"
                            onClick={() => updateStep(i, 'image', '')}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-400 transition bg-gray-50 cursor-pointer">
                          {step.uploading
                            ? <i className="fa fa-spinner fa-spin"></i>
                            : <i className="far fa-image"></i>
                          }
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => handleStepImageUpload(i, e)} disabled={step.uploading} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
              <i className="fa fa-exclamation-circle mr-2"></i>{error}
            </p>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="mx-auto max-w-[1200px] px-4 py-3 flex justify-between items-center">
          <button type="button" onClick={() => router.back()}
            className="text-gray-500 hover:text-red-500 font-medium transition">
            <i className="fa fa-arrow-left mr-2"></i> Huỷ
          </button>
          <button type="submit" disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-2.5 rounded-xl font-bold shadow-sm transition">
            {isPending ? <><i className="fa fa-spinner fa-spin mr-2"></i>Đang đăng...</> : 'Lên sóng'}
          </button>
        </div>
      </div>
      <div className="h-16" /> {/* spacer for sticky bar */}
    </form>
  )
}
