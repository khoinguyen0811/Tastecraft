'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/(auth)/actions'

interface UserProfile {
  username: string
  avatar: string | null
}

export default function AuthDropdown() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined) // undefined = loading
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch session + profile phía client
  useEffect(() => {
    async function fetchProfile() {
      // Dùng getSession() cho client — đọc từ cookie/localStorage, không gọi network
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setProfile(null); return }

      const user = session.user
      const { data } = await supabase
        .from('users')
        .select('username, avatar')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile({ username: data.username, avatar: data.avatar })
      } else {
        setProfile({ username: user.email?.split('@')[0] ?? 'user', avatar: null })
      }
    }

    fetchProfile()

    // Lắng nghe thay đổi auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    startTransition(async () => {
      await logout()
      setProfile(null)
      setOpen(false)
      router.push('/')
      router.refresh()
    })
  }

  // Đang load — hiện icon mờ
  if (profile === undefined) {
    return <i className="fa fa-user-circle text-2xl text-gray-300"></i>
  }

  const avatarUrl = profile?.avatar?.startsWith('http')
    ? profile.avatar
    : profile
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=fb923c&color=fff`
      : null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 hover:opacity-80 transition"
        aria-label="Tài khoản"
      >
        {profile ? (
          avatarUrl ? (
            <>
              <img
                src={avatarUrl}
                alt={profile.username}
                className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
              />
              <span className="hidden md:block text-sm font-medium">{profile.username}</span>
              <i className={`fa fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
            </>
          ) : (
            <i className="fa fa-user-circle text-2xl text-orange-500 transition"></i>
          )
        ) : (
          <i className="fa fa-user-circle text-2xl text-gray-600 hover:text-orange-500 transition"></i>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-xl w-56 z-50 overflow-hidden">
          {profile ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-bold text-sm">{profile.username}</p>
                <p className="text-xs text-gray-400">Thành viên Culinaria</p>
              </div>
              <div className="py-2">
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition">
                  <i className="fa fa-user w-4 text-gray-400"></i> Trang cá nhân
                </Link>
                <Link href="/my-recipes" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition">
                  <i className="fa fa-book-open w-4 text-gray-400"></i> Công thức của tôi
                </Link>
              </div>
              <div className="border-t border-gray-100 py-2">
                <button onClick={handleLogout} disabled={isPending}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                  <i className="fa fa-sign-out-alt w-4"></i>
                  {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-2">
              <Link href="/login" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition text-sm">
                <i className="fa fa-sign-in-alt"></i> Đăng nhập
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition text-sm">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
