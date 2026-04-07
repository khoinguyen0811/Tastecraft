'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { logout } from '@/app/(auth)/actions'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-th-large' },
  { href: '/dashboard/users', label: 'Người dùng', icon: 'fa-users' },
  { href: '/dashboard/recipes', label: 'Công thức', icon: 'fa-book-open' },
  { href: '/dashboard/reports', label: 'Báo cáo', icon: 'fa-flag' },
  { href: '/dashboard/events', label: 'Sự kiện', icon: 'fa-trophy' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push('/')
      router.refresh()
    })
  }

  return (
    <aside className="w-64 bg-[#f3f4f6] flex flex-col justify-between border-r border-gray-200 shrink-0 h-screen fixed left-0 top-0 z-10">
      <div>
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="w-10 h-10 bg-orange-400 text-white rounded-xl flex items-center justify-center mr-3 shadow-sm">
            <i className="fa fa-utensils text-sm"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">Bếp Nhà Làm</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin Console</p>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navLinks.map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                  isActive ? 'bg-orange-400 text-white font-bold shadow-md shadow-orange-200' : 'text-gray-600 hover:bg-gray-200'
                }`}>
                <i className={`fa ${icon} w-4 text-center`}></i> {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <Link href="/recipes/create"
          className="w-full bg-[#e88d39] hover:bg-[#d67b28] text-white py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center text-sm">
          <i className="fa fa-plus mr-2"></i> Tạo công thức
        </Link>
        <button onClick={handleLogout} disabled={isPending}
          className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 transition text-sm w-full">
          <i className="fa fa-sign-out-alt w-4 text-center"></i>
          {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    </aside>
  )
}
