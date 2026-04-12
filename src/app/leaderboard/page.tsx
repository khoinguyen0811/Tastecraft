import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/ui/Avatar'
import { getRankInfo } from '@/lib/xp'
import Link from 'next/link'
import XPGuide from './XPGuide'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar, xp, rank')
    .eq('is_shadow_banned', false)
    .order('xp', { ascending: false })
    .limit(10)

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const top3 = (users ?? []).slice(0, 3)
  const rest = (users ?? []).slice(3)

  // Podium order: 2nd (left) | 1st (center, tallest) | 3rd (right)
  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumStyles = [
    { height: 'h-28', bg: 'bg-gray-300', label: '🥈', ring: 'ring-gray-300', textColor: 'text-gray-500' },
    { height: 'h-40', bg: 'bg-yellow-400', label: '🥇', ring: 'ring-yellow-400', textColor: 'text-yellow-600' },
    { height: 'h-20', bg: 'bg-orange-400', label: '🥉', ring: 'ring-orange-400', textColor: 'text-orange-500' },
  ]

  return (
    <div className="px-4 py-10 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Cộng đồng</span>
        <h1 className="text-4xl font-bold font-serif mt-2 mb-3">Bảng xếp hạng</h1>
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-400 text-sm">Top đầu bếp tích cực nhất cộng đồng Bếp Nhà Làm</p>
          <XPGuide />
        </div>
      </div>

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-6 mb-12">
          {podiumOrder.map((u, idx) => {
            if (!u) return <div key={idx} className="w-28" />
            const style = podiumStyles[idx]
            const rankInfo = getRankInfo(u.xp ?? 0)
            const isMe = u.id === currentUser?.id
            return (
              <div key={u.id} className="flex flex-col items-center w-28">
                {/* Avatar */}
                <div className={`relative mb-2`}>
                  <Avatar
                    src={u.avatar}
                    name={u.username}
                    size={idx === 1 ? 'w-16 h-16' : 'w-12 h-12'}
                    className={`ring-4 ${style.ring} shadow-lg`}
                  />
                  <span className="absolute -bottom-1 -right-1 text-lg leading-none">{style.label}</span>
                </div>
                <p className={`font-bold text-sm text-center mb-0.5 ${isMe ? 'text-orange-600' : ''}`}>
                  {u.username}
                </p>
                <p className={`text-xs font-bold mb-2 ${style.textColor}`}>
                  {(u.xp ?? 0).toLocaleString()} XP
                </p>
                <p className="text-xs text-gray-400 mb-2">{rankInfo.icon} {rankInfo.name}</p>
                {/* Podium block */}
                <div className={`w-full ${style.height} ${style.bg} rounded-t-2xl flex items-start justify-center pt-2`}>
                  <span className="text-white font-extrabold text-lg">
                    {idx === 0 ? '2' : idx === 1 ? '1' : '3'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Top 4–10 */}
      {rest.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
          {rest.map((u, i) => {
            const rankInfo = getRankInfo(u.xp ?? 0)
            const isMe = u.id === currentUser?.id
            return (
              <div key={u.id}
                className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 transition ${isMe ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                <span className="w-7 text-center font-bold text-gray-400 text-sm shrink-0">{i + 4}</span>
                <Avatar src={u.avatar} name={u.username} size="w-9 h-9" />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${isMe ? 'text-orange-600' : ''}`}>
                    {u.username} {isMe && <span className="text-xs font-normal text-gray-400">(bạn)</span>}
                  </p>
                  <span className={`text-xs font-bold ${rankInfo.color}`}>{rankInfo.icon} {rankInfo.name}</span>
                </div>
                <span className="font-bold text-sm text-gray-700 shrink-0">{(u.xp ?? 0).toLocaleString()} XP</span>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-3">Tích lũy XP bằng cách tạo công thức, đánh giá và tham gia sự kiện</p>
        <div className="flex justify-center gap-3">
          <Link href="/recipes/create"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
            Tạo công thức +20 XP
          </Link>
          <Link href="/events"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm transition">
            Tham gia sự kiện +30 XP
          </Link>
        </div>
      </div>
    </div>
  )
}
