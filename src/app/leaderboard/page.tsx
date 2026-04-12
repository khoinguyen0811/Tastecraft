import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/ui/Avatar'
import { getRankInfo } from '@/lib/xp'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar, xp, rank')
    .eq('is_shadow_banned', false)
    .order('xp', { ascending: false })
    .limit(50)

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Lấy rank của user hiện tại nếu không trong top 50
  let myRank: number | null = null
  if (currentUser) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_shadow_banned', false)
      .gt('xp', (users ?? []).find(u => u.id === currentUser.id)?.xp ?? 0)
    myRank = (count ?? 0) + 1
  }

  const top3 = (users ?? []).slice(0, 3)
  const rest = (users ?? []).slice(3)

  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div className="px-4 py-10 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Cộng đồng</span>
        <h1 className="text-4xl font-bold font-serif mt-2 mb-3">Bảng xếp hạng</h1>
        <p className="text-gray-400">Top đầu bếp tích cực nhất cộng đồng Bếp Nhà Làm</p>
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((u, idx) => {
            const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
            const heights = ['h-28', 'h-36', 'h-24']
            const rankInfo = getRankInfo(u.xp ?? 0)
            return (
              <div key={u.id} className={`flex flex-col items-center ${idx === 1 ? 'order-first' : ''}`}>
                <Avatar src={u.avatar} name={u.username} size="w-14 h-14" className="mb-2 ring-4 ring-white shadow-lg" />
                <p className="font-bold text-sm mb-1">{u.username}</p>
                <p className="text-xs text-gray-400 mb-2">{u.xp ?? 0} XP</p>
                <div className={`${heights[realIdx]} w-20 ${realIdx === 0 ? 'bg-yellow-400' : realIdx === 1 ? 'bg-gray-300' : 'bg-orange-400'} rounded-t-2xl flex items-start justify-center pt-3`}>
                  <span className="text-2xl">{MEDAL[realIdx]}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
        {rest.map((u, i) => {
          const rankInfo = getRankInfo(u.xp ?? 0)
          const isMe = u.id === currentUser?.id
          return (
            <div key={u.id}
              className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 ${isMe ? 'bg-orange-50' : 'hover:bg-gray-50'} transition`}>
              <span className="w-8 text-center font-bold text-gray-400 text-sm">{i + 4}</span>
              <Avatar src={u.avatar} name={u.username} size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isMe ? 'text-orange-600' : ''}`}>
                  {u.username} {isMe && <span className="text-xs font-normal">(bạn)</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-bold ${rankInfo.color}`}>{rankInfo.icon} {rankInfo.name}</span>
                </div>
              </div>
              <span className="font-bold text-sm text-gray-700">{(u.xp ?? 0).toLocaleString()} XP</span>
            </div>
          )
        })}
      </div>

      {/* My position nếu ngoài top 50 */}
      {currentUser && myRank && myRank > 50 && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl px-6 py-4 flex items-center gap-4">
          <span className="font-bold text-orange-500">#{myRank}</span>
          <p className="text-sm text-gray-600">Vị trí của bạn — tiếp tục tích lũy XP để leo hạng!</p>
          <Link href="/recipes/create" className="ml-auto text-xs font-bold text-orange-500 hover:underline">
            Tạo công thức +20 XP
          </Link>
        </div>
      )}
    </div>
  )
}
