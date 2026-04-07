'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'
import { toggleRecipeActiveAdmin, deleteRecipeAdmin } from './actions'
import { difficultyLabel, type Difficulty } from '@/types'

interface Recipe {
  id: number
  title: string
  slug: string
  image_main: string
  difficulty: Difficulty
  is_active: boolean
  created_at: string
  author: string
}

export default function RecipeAdminTable({ recipes }: { recipes: Recipe[] }) {
  const [list, setList] = useState(recipes)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase()))

  function handleToggle(id: number, current: boolean) {
    startTransition(async () => {
      const result = await toggleRecipeActiveAdmin(id, current)
      if (!result.error) setList(l => l.map(r => r.id === id ? { ...r, is_active: !current } : r))
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Xoá công thức này?')) return
    startTransition(async () => {
      const result = await deleteRecipeAdmin(id)
      if (!result.error) setList(l => l.filter(r => r.id !== id))
    })
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc tác giả..."
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <span className="text-sm text-gray-400">{filtered.length} kết quả</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left">Công thức</th>
              <th className="px-6 py-4 text-left">Tác giả</th>
              <th className="px-6 py-4 text-left">Độ khó</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-left">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      <RecipeImage src={r.image_main} alt={r.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium line-clamp-1 max-w-[200px]">{r.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{r.author}</td>
                <td className="px-6 py-4 text-gray-500">{difficultyLabel[r.difficulty]}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {r.is_active ? 'Hiển thị' : 'Đã ẩn'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/recipes/${r.slug}`} target="_blank"
                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-medium transition">
                      Xem
                    </Link>
                    <button onClick={() => handleToggle(r.id, r.is_active)} disabled={isPending}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-xs font-medium transition">
                      {r.is_active ? 'Ẩn' : 'Hiện'}
                    </button>
                    <button onClick={() => handleDelete(r.id)} disabled={isPending}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-xs font-medium transition">
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
