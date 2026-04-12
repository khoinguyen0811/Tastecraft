'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import { toggleUserRole, deleteUser, banUser, updateUserXP } from './actions'

interface User {
  id: string
  username: string
  email: string
  role: string
  avatar: string | null
  xp: number
  rank: string
  banned_until: string | null
  created_at: string
}

type ModalType = 'role' | 'delete' | 'ban' | 'xp' | null

function isBanned(u: User) {
  return u.banned_until && new Date(u.banned_until) > new Date()
}

function ConfirmModal({ type, user, onClose, onConfirm }: {
  type: ModalType; user: User; onClose: () => void
  onConfirm: (data?: any) => void
}) {
  const [banDays, setBanDays] = useState(7)
  const [xpValue, setXpValue] = useState(user.xp ?? 0)
  const [isPending, startTransition] = useTransition()

  if (!type) return null

  const configs = {
    role: {
      title: user.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin',
      desc: `Bạn có chắc muốn ${user.role === 'admin' ? 'hạ' : 'nâng'} quyền của "${user.username}"?`,
      confirmText: 'Xác nhận',
      confirmClass: 'bg-orange-500 hover:bg-orange-600',
    },
    delete: {
      title: 'Xoá tài khoản',
      desc: `Hành động này không thể hoàn tác. Tài khoản "${user.username}" sẽ bị xoá vĩnh viễn.`,
      confirmText: 'Xoá vĩnh viễn',
      confirmClass: 'bg-red-500 hover:bg-red-600',
    },
    ban: {
      title: isBanned(user) ? 'Gỡ ban' : 'Ban tài khoản',
      desc: isBanned(user)
        ? `Gỡ ban cho "${user.username}"?`
        : `Ban tài khoản "${user.username}" trong bao nhiêu ngày?`,
      confirmText: isBanned(user) ? 'Gỡ ban' : 'Xác nhận ban',
      confirmClass: isBanned(user) ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
    },
    xp: {
      title: 'Chỉnh sửa XP',
      desc: `Nhập XP mới cho "${user.username}"`,
      confirmText: 'Lưu',
      confirmClass: 'bg-orange-500 hover:bg-orange-600',
    },
  }

  const cfg = configs[type]

  function handleConfirm() {
    startTransition(async () => {
      if (type === 'ban') onConfirm(isBanned(user) ? 0 : banDays)
      else if (type === 'xp') onConfirm(xpValue)
      else onConfirm()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}>
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-2">{cfg.title}</h3>
        <p className="text-sm text-gray-500 mb-6">{cfg.desc}</p>

        {type === 'ban' && !isBanned(user) && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Số ngày ban</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {[1, 3, 7, 14, 30].map(d => (
                <button key={d} type="button" onClick={() => setBanDays(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${banDays === d ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {d} ngày
                </button>
              ))}
            </div>
            <input type="number" min={1} max={365} value={banDays}
              onChange={e => setBanDays(Number(e.target.value))}
              className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-300" />
          </div>
        )}

        {type === 'xp' && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">XP mới</label>
            <input type="number" min={0} value={xpValue}
              onChange={e => setXpValue(Number(e.target.value))}
              className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" />
            <p className="text-xs text-gray-400 mt-1">Hiện tại: {user.xp ?? 0} XP · {user.rank}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={isPending}
            className={`flex-1 ${cfg.confirmClass} disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm`}>
            {isPending ? 'Đang xử lý...' : cfg.confirmText}
          </button>
          <button onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-xl transition text-sm">
            Huỷ
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionMenu({ user, onAction }: { user: User; onAction: (type: ModalType) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const banned = isBanned(user)

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition">
        <i className="fa fa-ellipsis-h text-sm"></i>
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl w-48 z-30 overflow-hidden">
          <button onClick={() => { onAction('xp'); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
            <i className="fa fa-star w-4 text-yellow-500"></i> Chỉnh sửa XP
          </button>
          <button onClick={() => { onAction('role'); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
            <i className="fa fa-shield-alt w-4 text-orange-500"></i>
            {user.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin'}
          </button>
          <button onClick={() => { onAction('ban'); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition ${banned ? 'text-green-600' : 'text-orange-600'}`}>
            <i className={`fa ${banned ? 'fa-unlock' : 'fa-ban'} w-4`}></i>
            {banned ? 'Gỡ ban' : 'Ban tài khoản'}
          </button>
          <div className="border-t border-gray-100">
            <button onClick={() => { onAction('delete'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
              <i className="fa fa-trash w-4"></i> Xoá tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserTable({ users }: { users: User[] }) {
  const [list, setList] = useState(users)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all')
  const [filterBan, setFilterBan] = useState<'all' | 'banned' | 'active'>('all')
  const [modal, setModal] = useState<{ type: ModalType; user: User } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = list.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || u.role === filterRole
    const matchBan = filterBan === 'all' ||
      (filterBan === 'banned' && isBanned(u)) ||
      (filterBan === 'active' && !isBanned(u))
    return matchSearch && matchRole && matchBan
  })

  function handleConfirm(data?: any) {
    if (!modal) return
    const { type, user } = modal
    startTransition(async () => {
      if (type === 'role') {
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        const r = await toggleUserRole(user.id, newRole)
        if (!r.error) setList(l => l.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      } else if (type === 'delete') {
        const r = await deleteUser(user.id)
        if (!r.error) setList(l => l.filter(u => u.id !== user.id))
      } else if (type === 'ban') {
        const days = data as number
        const r = await banUser(user.id, days)
        if (!r.error) {
          const bannedUntil = days === 0 ? null
            : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
          setList(l => l.map(u => u.id === user.id ? { ...u, banned_until: bannedUntil } : u))
        }
      } else if (type === 'xp') {
        const xp = data as number
        const r = await updateUserXP(user.id, xp)
        if (!r.error) {
          let rank = 'Bronze'
          if (xp >= 1500) rank = 'Diamond'
          else if (xp >= 700) rank = 'Platinum'
          else if (xp >= 300) rank = 'Gold'
          else if (xp >= 100) rank = 'Silver'
          setList(l => l.map(u => u.id === user.id ? { ...u, xp, rank } : u))
        }
      }
      setModal(null)
    })
  }

  const RANK_COLORS: Record<string, string> = {
    Diamond: 'text-cyan-500', Platinum: 'text-purple-500',
    Gold: 'text-yellow-500', Silver: 'text-gray-400', Bronze: 'text-orange-600',
  }
  const RANK_ICONS: Record<string, string> = {
    Diamond: '💎', Platinum: '🔮', Gold: '🥇', Silver: '🥈', Bronze: '🥉',
  }

  return (
    <>
      {modal && (
        <ConfirmModal type={modal.type} user={modal.user}
          onClose={() => setModal(null)} onConfirm={handleConfirm} />
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="flex gap-2">
            {(['all', 'admin', 'user'] as const).map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterRole === r ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'User'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'banned'] as const).map(b => (
              <button key={b} onClick={() => setFilterBan(b)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterBan === b ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {b === 'all' ? 'Tất cả' : b === 'active' ? 'Hoạt động' : 'Bị ban'}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400 ml-auto">{filtered.length} kết quả</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Người dùng</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Vai trò</th>
                <th className="px-6 py-4 text-left">XP / Hạng</th>
                <th className="px-6 py-4 text-left">Trạng thái</th>
                <th className="px-6 py-4 text-left">Ngày tham gia</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const banned = isBanned(u)
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 transition ${banned ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.username} size="w-9 h-9" />
                        <span className="font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-sm">{(u.xp ?? 0).toLocaleString()} XP</span>
                        <p className={`text-xs font-bold ${RANK_COLORS[u.rank] ?? 'text-gray-400'}`}>
                          {RANK_ICONS[u.rank]} {u.rank}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {banned ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">Bị ban</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            đến {new Date(u.banned_until!).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">Hoạt động</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu user={u} onAction={type => setModal({ type, user: u })} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
