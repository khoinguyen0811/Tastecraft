'use client'

import { useState, useTransition } from 'react'
import Avatar from '@/components/ui/Avatar'
import { toggleUserRole, deleteUser } from './actions'

interface User {
  id: string
  username: string
  email: string
  role: string
  avatar: string | null
  created_at: string
}

export default function UserTable({ users }: { users: User[] }) {
  const [list, setList] = useState(users)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = list.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggleRole(id: string, currentRole: string) {
    startTransition(async () => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      const result = await toggleUserRole(id, newRole)
      if (!result.error) setList(l => l.map(u => u.id === id ? { ...u, role: newRole } : u))
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Xoá tài khoản này?')) return
    startTransition(async () => {
      const result = await deleteUser(id)
      if (!result.error) setList(l => l.filter(u => u.id !== id))
    })
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <span className="text-sm text-gray-400">{filtered.length} kết quả</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left">Người dùng</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Vai trò</th>
              <th className="px-6 py-4 text-left">Ngày tham gia</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.username} size="w-8 h-8" />
                    <span className="font-medium">{u.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleToggleRole(u.id, u.role)} disabled={isPending}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-xs font-medium transition">
                      {u.role === 'admin' ? 'Hạ xuống user' : 'Nâng lên admin'}
                    </button>
                    <button onClick={() => handleDelete(u.id)} disabled={isPending}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-xs font-medium transition">
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
