'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: 'fa-th-large' },
    { href: '/recipes', label: 'Recipes', icon: 'fa-book-open' },
    { href: '/dashboard/users', label: 'Users', icon: 'fa-users' },
    { href: '/dashboard/reports', label: 'Reports', icon: 'fa-chart-bar' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'fa-cog' },
  ]

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <aside className="w-64 bg-[#f3f4f6] flex flex-col justify-between border-r border-gray-200 shrink-0 h-screen fixed left-0 top-0">
      <div>
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="w-10 h-10 bg-orange-400 text-white rounded-xl flex items-center justify-center font-bold text-xl mr-3 shadow-sm">
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
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-3 rounded-xl transition font-medium ${
                  isActive
                    ? 'bg-orange-400 text-white font-bold shadow-md shadow-orange-200'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`fa ${icon} w-6`}></i> {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-4">
        <Link
          href="/recipes/create"
          className="w-full bg-[#e88d39] hover:bg-[#d67b28] text-white py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center"
        >
          <i className="fa fa-plus mr-2"></i> Tạo công thức
        </Link>
        <nav className="space-y-1">
          <a href="#" className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-800 transition text-sm">
            <i className="far fa-question-circle w-6"></i> Support
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-500 hover:text-red-600 transition text-sm w-full text-left"
          >
            <i className="fa fa-sign-out-alt w-6"></i> Logout
          </button>
        </nav>
      </div>
    </aside>
  )
}
