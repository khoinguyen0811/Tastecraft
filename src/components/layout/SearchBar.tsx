'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !value.trim()) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', value.trim())
    params.delete('page')
    router.push(`/recipes?${params.toString()}`)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="món ăn hàng ngày"
        className="bg-gray-100 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-orange-300 w-64 transition"
      />
      <i className="fa fa-search absolute left-4 top-3 text-gray-400"></i>
    </div>
  )
}
