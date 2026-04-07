import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AuthDropdown from './AuthDropdown'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { username: string; avatar: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('username, avatar')
      .eq('id', user.id)
      .maybeSingle()
    profile = data ?? { username: user.email?.split('@')[0] ?? 'user', avatar: null }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-orange-600">Culinaria</Link>

        <nav className="hidden md:flex space-x-6 font-medium">
          <Link href="/" className="hover:text-orange-600">Trang chủ</Link>
          <Link href="/recipes" className="hover:text-orange-600">Khám phá công thức</Link>
          <Link href="/events" className="hover:text-orange-600">Sự kiện</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Suspense fallback={
            <div className="relative">
              <input placeholder="món ăn hàng ngày" className="bg-gray-100 rounded-full py-2 px-10 w-64" readOnly />
              <i className="fa fa-search absolute left-4 top-3 text-gray-400"></i>
            </div>
          }>
            <SearchBar />
          </Suspense>
          <NotificationBell />
          <AuthDropdown initialProfile={profile} />
        </div>
      </div>
    </header>
  )
}
