import { getRankInfo } from '@/lib/xp'
import Link from 'next/link'

export default function RankCard({ xp, rank }: { xp: number; rank: string }) {
  const info = getRankInfo(xp)

  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-sm ${info.bg} border border-gray-100`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hạng của bạn</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            <span className={`text-xl font-extrabold ${info.color}`}>{info.name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-gray-800">{xp.toLocaleString()}</p>
          <p className="text-xs text-gray-400">XP</p>
        </div>
      </div>

      {/* Progress bar */}
      {info.next && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{info.name}</span>
            <span>{info.next.name} ({info.next.min} XP)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${info.color.replace('text-', 'bg-')}`}
              style={{ width: `${info.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            Còn {info.next.min - xp} XP để lên {info.next.name}
          </p>
        </div>
      )}

      <Link href="/leaderboard"
        className="block w-full text-center text-xs font-bold text-orange-500 hover:underline mt-2">
        Xem bảng xếp hạng →
      </Link>
    </div>
  )
}
