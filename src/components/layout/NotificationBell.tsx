'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  return `${Math.floor(h / 24)} ngày trước`
}

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  recipe_hidden:    { icon: 'fa-ban', color: 'text-red-500 bg-red-50' },
  report_actioned:  { icon: 'fa-flag', color: 'text-orange-500 bg-orange-50' },
  report_received:  { icon: 'fa-exclamation-circle', color: 'text-yellow-500 bg-yellow-50' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unread = notifs.filter(n => !n.is_read).length

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifs(data ?? [])
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markAllRead() {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('notifications').update({ is_read: true })
        .eq('user_id', user.id).eq('is_read', false)
      setNotifs(n => n.map(x => ({ ...x, is_read: true })))
    })
  }

  if (notifs.length === 0 && !open) {
    return (
      <button className="text-gray-500 hover:text-orange-500 transition relative">
        <i className="fa fa-bell text-xl"></i>
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="relative text-gray-500 hover:text-orange-500 transition">
        <i className="fa fa-bell text-xl"></i>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-xl w-80 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h4 className="font-bold text-sm">Thông báo</h4>
            {unread > 0 && (
              <button onClick={markAllRead} disabled={isPending}
                className="text-xs text-orange-500 hover:underline font-medium">
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Không có thông báo nào</p>
            ) : notifs.map(n => {
              const meta = TYPE_ICON[n.type] ?? { icon: 'fa-bell', color: 'text-gray-500 bg-gray-50' }
              const content = (
                <div className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition ${!n.is_read ? 'bg-orange-50/40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                    <i className={`fa ${meta.icon} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'} text-gray-800 mb-0.5`}>{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 bg-orange-400 rounded-full shrink-0 mt-1.5"></div>}
                </div>
              )
              return n.link
                ? <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>{content}</Link>
                : <div key={n.id}>{content}</div>
            })}
          </div>
        </div>
      )}
    </div>
  )
}
