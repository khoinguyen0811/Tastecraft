'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateReportStatus, forceHideRecipe } from './actions'

interface Report {
  id: number
  reason: string
  note: string | null
  status: 'pending' | 'reviewed' | 'dismissed'
  created_at: string
  recipes: { id: number; title: string; slug: string } | null
  users: { username: string } | null
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-600' },
  reviewed:  { label: 'Đã xem xét', color: 'bg-green-100 text-green-600' },
  dismissed: { label: 'Bỏ qua', color: 'bg-gray-100 text-gray-400' },
}

export default function ReportTable({ reports }: { reports: Report[] }) {
  const [list, setList] = useState(reports)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all')
  const [isPending, startTransition] = useTransition()

  const filtered = filter === 'all' ? list : list.filter(r => r.status === filter)

  function handleForceHide(reportId: number, recipeId: number) {
    if (!confirm('Buộc ẩn công thức này? User sẽ không thể bật lại.')) return
    startTransition(async () => {
      const result = await forceHideRecipe(reportId, recipeId)
      if (!result.error) setList(l => l.map(r => r.id === reportId ? { ...r, status: 'reviewed' } : r))
    })
  }

  function handleStatus(id: number, status: 'reviewed' | 'dismissed') {
    startTransition(async () => {
      const result = await updateReportStatus(id, status)
      if (!result.error) setList(l => l.map(r => r.id === id ? { ...r, status } : r))
    })
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'reviewed', 'dismissed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            {f === 'all' ? 'Tất cả' : STATUS_LABEL[f].label}
            <span className="ml-2 text-xs opacity-70">
              {f === 'all' ? list.length : list.filter(r => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa fa-check-circle text-4xl text-green-300 mb-4 block"></i>
            <p className="text-gray-400">Không có báo cáo nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(report => (
              <div key={report.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  report.status === 'pending' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  <i className="fa fa-flag text-sm"></i>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{report.users?.username ?? 'Ẩn danh'}</span>
                    <span className="text-gray-300">·</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_LABEL[report.status].color}`}>
                      {STATUS_LABEL[report.status].label}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(report.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-700 mb-1">{report.reason}</p>
                  {report.note && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mb-2 italic">"{report.note}"</p>
                  )}
                  {report.recipes && (
                    <Link href={`/recipes/${report.recipes.slug}`} target="_blank"
                      className="text-xs text-orange-500 hover:underline font-medium">
                      <i className="fa fa-external-link-alt mr-1"></i>{report.recipes.title}
                    </Link>
                  )}
                </div>

                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => report.recipes && handleForceHide(report.id, report.recipes.id)} disabled={isPending}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition whitespace-nowrap">
                      <i className="fa fa-ban mr-1"></i> Buộc ẩn
                    </button>
                    <button onClick={() => handleStatus(report.id, 'reviewed')} disabled={isPending}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition">
                      Đã xem xét
                    </button>
                    <button onClick={() => handleStatus(report.id, 'dismissed')} disabled={isPending}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-bold transition">
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
