'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '../actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Full reload để Supabase browser client đọc lại session cookie từ server
        window.location.href = '/'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold text-orange-600 font-serif">Bếp Nhà Làm</Link>
          <p className="text-gray-500 mt-2">Chào mừng trở lại</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm p-10">
          <h1 className="text-2xl font-bold mb-8">Đăng nhập</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
