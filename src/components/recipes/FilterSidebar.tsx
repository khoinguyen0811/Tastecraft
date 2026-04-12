'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tag } from '@/types'

interface Props {
  cuisineTags: Tag[]
  dietTags: Tag[]
}

export default function FilterSidebar({ cuisineTags, dietTags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeTags = searchParams.getAll('tag')

  function toggleTag(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll('tag')
    params.delete('tag')
    if (current.includes(slug)) {
      current.filter(t => t !== slug).forEach(t => params.append('tag', t))
    } else {
      [...current, slug].forEach(t => params.append('tag', t))
    }
    params.delete('page')
    startTransition(() => router.push(`/recipes?${params.toString()}`))
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    params.delete('page')
    startTransition(() => router.push(`/recipes?${params.toString()}`))
  }

  return (
    <aside className={`w-full md:w-64 shrink-0 space-y-8 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
          <i className="fa fa-spinner fa-spin"></i> Đang lọc...
        </div>
      )}

      {activeTags.length > 0 && !isPending && (
        <button onClick={clearFilters}
          className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1">
          <i className="fa fa-times"></i> Xóa bộ lọc ({activeTags.length})
        </button>
      )}

      <section>
        <h3 className="font-bold mb-4 uppercase text-sm tracking-wider text-gray-500">Ẩm thực</h3>
        <div className="space-y-3">
          {cuisineTags.map(tag => (
            <label key={tag.id} className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox"
                checked={activeTags.includes(tag.slug)}
                onChange={() => toggleTag(tag.slug)}
                className="accent-orange-500 w-4 h-4" />
              <span className="text-sm group-hover:text-orange-600 transition">{tag.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold mb-4 uppercase text-sm tracking-wider text-gray-500">Chế độ ăn</h3>
        <div className="flex flex-wrap gap-2">
          {dietTags.map(tag => (
            <button key={tag.id} onClick={() => toggleTag(tag.slug)}
              className={`px-4 py-2 border rounded-full text-sm transition ${
                activeTags.includes(tag.slug)
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'hover:bg-orange-50 hover:border-orange-300'
              }`}>
              {tag.name}
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}
