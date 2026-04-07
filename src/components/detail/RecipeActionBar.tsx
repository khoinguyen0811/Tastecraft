'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toggleSaveRecipe } from '@/app/recipes/[slug]/actions'
import { submitReport } from '@/app/recipes/[slug]/reportActions'

const REPORT_REASONS = [
  'Nội dung không phù hợp',
  'Thông tin sai lệch / gây hại',
  'Vi phạm bản quyền',
  'Spam hoặc quảng cáo',
  'Công thức trùng lặp',
  'Khác',
]

interface Props {
  recipeId: number
  slug: string
  initialSaved: boolean
}

export default function RecipeActionBar({ recipeId, slug, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isReporting, startReport] = useTransition()
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await toggleSaveRecipe(recipeId, slug)
      if (result.error) showToast(result.error, 'err')
      else { setSaved(result.saved!); showToast(result.saved ? 'Đã lưu công thức' : 'Đã bỏ lưu') }
    })
  }

  function openReport() {
    setMenuOpen(false)
    setSelectedReason('')
    setNote('')
    setReportOpen(true)
  }

  function handleReport() {
    if (!selectedReason) return
    startReport(async () => {
      const result = await submitReport(recipeId, selectedReason, note)
      if (result.error) { showToast(result.error, 'err'); return }
      setReportOpen(false)
      showToast('Đã gửi báo cáo, cảm ơn bạn!')
    })
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-3">
        {/* Save */}
        <button onClick={handleSave} disabled={isPending}
          className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition shadow-md ${
            saved ? 'bg-orange-100 text-orange-600 border border-orange-300 hover:bg-orange-200'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
          }`}>
          <i className="fa fa-heart"></i>
          {isPending ? 'Đang xử lý...' : saved ? 'Đã lưu' : 'Lưu công thức'}
        </button>

        {/* Share */}
        <button onClick={() => navigator.share?.({ title: document.title, url: location.href })}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-xl transition">
          <i className="fa fa-share-alt"></i> Chia sẻ
        </button>

        {/* Print */}
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-xl transition">
          <i className="fa fa-print"></i> In
        </button>

        {/* 3-dot menu */}
        <div className="relative ml-auto" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition">
            <i className="fa fa-ellipsis-h text-gray-500"></i>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-xl w-52 z-50 overflow-hidden">
              <button onClick={openReport}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50 transition">
                <i className="fa fa-flag"></i> Báo cáo công thức
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mt-3 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl ${toast.type === 'ok' ? 'bg-gray-800 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <i className={`fa ${toast.type === 'ok' ? 'fa-check-circle text-green-400' : 'fa-exclamation-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Báo cáo công thức</h3>
              <button onClick={() => setReportOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400">
                <i className="fa fa-times"></i>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5">Chọn lý do báo cáo:</p>

            <div className="space-y-2 mb-5">
              {REPORT_REASONS.map(reason => (
                <label key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                    selectedReason === reason ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}>
                  <input type="radio" name="reason" value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-orange-500" />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>

            {/* Note field khi chọn "Khác" */}
            {selectedReason === 'Khác' && (
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none mb-5"
              />
            )}

            <div className="flex gap-3">
              <button onClick={handleReport}
                disabled={!selectedReason || isReporting || (selectedReason === 'Khác' && !note.trim())}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm">
                {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
              <button onClick={() => setReportOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-xl transition text-sm">
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
