'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '../actions'

function getStrength(pw: string): { score: number; label: string; color: string; checks: Record<string, boolean> } {
  const checks = {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    number:  /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
  const score = Object.values(checks).filter(Boolean).length
  const map = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Rất yếu', color: 'bg-red-500' },
    { label: 'Yếu', color: 'bg-orange-400' },
    { label: 'Trung bình', color: 'bg-yellow-400' },
    { label: 'Mạnh', color: 'bg-green-500' },
  ]
  return { score, ...map[score], checks }
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState('')
  const router = useRouter()

  const strength = getStrength(password)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (formData.get('password') !== formData.get('confirm')) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        window.location.href = '/'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold text-orange-600 font-serif">Bếp Nhà Làm</Link>
          <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm p-10">
          <h1 className="text-2xl font-bold mb-8">Đăng ký</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên người dùng</label>
              <input name="username" type="text" required placeholder="chef_nguyen"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input name="email" type="email" required placeholder="email@example.com"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Password + strength meter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                name="password" type="password" required minLength={6}
                placeholder="Tối thiểu 6 ký tự"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      strength.score <= 1 ? 'text-red-500' :
                      strength.score === 2 ? 'text-orange-400' :
                      strength.score === 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>{strength.label}</span>
                    <div className="flex gap-3 text-[10px] text-gray-400">
                      <span className={strength.checks.length ? 'text-green-500' : ''}>
                        <i className={`fa fa-${strength.checks.length ? 'check' : 'times'} mr-1`}></i>8+ ký tự
                      </span>
                      <span className={strength.checks.upper ? 'text-green-500' : ''}>
                        <i className={`fa fa-${strength.checks.upper ? 'check' : 'times'} mr-1`}></i>Hoa
                      </span>
                      <span className={strength.checks.number ? 'text-green-500' : ''}>
                        <i className={`fa fa-${strength.checks.number ? 'check' : 'times'} mr-1`}></i>Số
                      </span>
                      <span className={strength.checks.special ? 'text-green-500' : ''}>
                        <i className={`fa fa-${strength.checks.special ? 'check' : 'times'} mr-1`}></i>Ký tự đặc biệt
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <input name="confirm" type="password" required placeholder="••••••••"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition">
              {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-orange-600 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
