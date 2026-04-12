'use client'

import { useState } from 'react'

interface DailyData {
  day: number
  label: string
  count: number
}

interface Props {
  dailyData: DailyData[]
  currentMonth: number
  currentYear: number
}

const MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

export default function BarChart({ dailyData, currentMonth, currentYear }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null)
  const maxCount = Math.max(...dailyData.map(d => d.count), 1)
  const total = dailyData.reduce((s, d) => s + d.count, 0)
  const today = new Date().getDate()

  const CHART_H = 160

  // SVG line path — chỉ vẽ đến ngày hôm nay
  const activeDays = dailyData.filter(d => d.day <= today)
  const points = activeDays.map((d, i) => {
    const x = dailyData.length === 1 ? 50 : ((d.day - 1) / (dailyData.length - 1)) * 100
    const y = CHART_H - (d.count / maxCount) * CHART_H
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = points.length > 0 ? [
    `M ${points[0].x} ${CHART_H}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${CHART_H}`,
    'Z',
  ].join(' ') : ''

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Xu hướng đăng tải công thức</h3>
          <p className="text-sm text-gray-500 mt-1">
            {MONTH_NAMES[currentMonth - 1]} {currentYear} · theo ngày
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-gray-400">Tháng này</p>
            <p className="font-bold text-gray-800 text-xl">{total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hôm nay</p>
            <p className="font-bold text-orange-500 text-xl">
              {dailyData.find(d => d.day === today)?.count ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Bars */}
        <div className="flex items-end gap-px h-48 mb-1">
          {dailyData.map(item => {
            const heightPct = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 4 : 0)
            const isToday = item.day === today
            const isFuture = item.day > today
            const isHovered = tooltip === item.day
            return (
              <div key={item.day}
                className="flex-1 flex flex-col items-center justify-end relative h-full cursor-pointer"
                onMouseEnter={() => setTooltip(item.day)}
                onMouseLeave={() => setTooltip(null)}>
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-lg">
                    Ngày {item.day}: {item.count} CT
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
                <div
                  className={`w-full rounded-t transition-all duration-150 ${
                    isFuture ? 'bg-gray-100' :
                    isToday ? 'bg-orange-500' :
                    isHovered ? 'bg-orange-500' : 'bg-orange-300'
                  }`}
                  style={{ height: isFuture ? '2px' : `${heightPct}%` }}
                />
              </div>
            )
          })}
        </div>

        {/* SVG line overlay */}
        {points.length > 1 && (
          <div className="absolute inset-0 pointer-events-none" style={{ bottom: '4px', top: 0 }}>
            <svg viewBox={`0 0 100 ${CHART_H}`} preserveAspectRatio="none" className="w-full h-full">
              <path d={areaPath} fill="rgba(249,115,22,0.1)" />
              <path d={linePath} fill="none" stroke="#f97316" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" />
              {points.filter(p => p.count > 0).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.8"
                  fill="white" stroke="#f97316" strokeWidth="1.2" />
              ))}
            </svg>
          </div>
        )}

        {/* X labels — chỉ hiện ngày 1, 5, 10, 15, 20, 25, cuối tháng */}
        <div className="flex mt-2">
          {dailyData.map(item => {
            const show = [1, 5, 10, 15, 20, 25].includes(item.day) || item.day === dailyData.length
            return (
              <div key={item.day} className="flex-1 text-center">
                {show && (
                  <span className={`text-[10px] font-medium ${item.day === today ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    {item.day}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
