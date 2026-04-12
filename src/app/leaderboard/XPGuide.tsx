'use client'

import { useState } from 'react'
import { XP_MAP } from '@/lib/xp'

const GUIDE = [
  { action: 'Tạo công thức', xp: XP_MAP.POST, icon: 'fa-utensils', color: 'bg-orange-100 text-orange-600', tip: 'Mỗi công thức mới bạn đăng lên' },
  { action: 'Đánh giá công thức', xp: XP_MAP.COMMENT, icon: 'fa-star', color: 'bg-yellow-100 text-yellow-600', tip: 'Viết nhận xét cho công thức của người khác' },
  { action: 'Tham gia sự kiện', xp: XP_MAP.EVENT_JOIN, icon: 'fa-trophy', color: 'bg-purple-100 text-purple-600', tip: 'Gửi công thức vào các thử thách cộng đồng' },
  { action: 'Thắng sự kiện', xp: XP_MAP.EVENT_WIN, icon: 'fa-crown', color: 'bg-yellow-100 text-yellow-700', tip: 'Được admin chọn là người chiến thắng' },
]

const RANKS = [
  { name: 'Bronze', min: 0, icon: '🥉', color: 'text-orange-600' },
  { name: 'Silver', min: 100, icon: '🥈', color: 'text-gray-500' },
  { name: 'Gold', min: 300, icon: '🥇', color: 'text-yellow-500' },
  { name: 'Platinum', min: 700, icon: '🔮', color: 'text-purple-500' },
  { name: 'Diamond', min: 1500, icon: '💎', color: 'text-cyan-500' },
]

export default function XPGuide() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-500 text-gray-400 flex items-center justify-center transition text-sm font-bold"
        title="Cách kiếm XP"
      >
        <i className="fa fa-question"></i>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Cách kiếm XP ⚡</h3>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <i className="fa fa-times"></i>
              </button>
            </div>

            {/* XP actions */}
            <div className="space-y-3 mb-8">
              {GUIDE.map(g => (
                <div key={g.action} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${g.color}`}>
                    <i className={`fa ${g.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{g.action}</p>
                    <p className="text-xs text-gray-400">{g.tip}</p>
                  </div>
                  <span className="font-extrabold text-orange-500 text-sm shrink-0">+{g.xp} XP</span>
                </div>
              ))}
            </div>

            {/* Rank levels */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Các mốc hạng</p>
              <div className="grid grid-cols-5 gap-2">
                {RANKS.map(r => (
                  <div key={r.name} className="text-center">
                    <span className="text-2xl block mb-1">{r.icon}</span>
                    <p className={`text-xs font-bold ${r.color}`}>{r.name}</p>
                    <p className="text-[10px] text-gray-400">{r.min} XP</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-6 text-center">
              XP được tính theo giới hạn mỗi ngày để đảm bảo công bằng
            </p>
          </div>
        </div>
      )}
    </>
  )
}
