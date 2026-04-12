'use client'

import { useState } from 'react'

interface MonthlyData {
  month: string
  count: number
}

export default function BarChart({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const last7 = monthlyData.slice(-7)
  const maxCount = Math.max(...last7.map(d => d.count), 1)
  const [tooltip, setTooltip] = useState<{ idx: number; x: number } | null>(null)

  const CHART_H = 160
  const CHART_W = 100 // percentage-based, use viewBox

  // SVG line path points (normalized 0–100)
  const points = last7.map((d, i) => {
    const x = last7.length === 1 ? 50 : (i / (last7.length - 1)) * 100
    const y = CHART_H - (d.count / maxCount) * CHART_H
    return { x, y, ...d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaPath = [
    `M ${points[0].x} ${CHART_H}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${CHART_H}`,
    'Z',
  ].join(' ')

  const total = last7.reduce((s, d) => s + d.count, 0)
  const avg = last7.length ? Math.round(total / last7.length) : 0

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Xu hướng đăng tải công thức</h3>
          <p className="text-sm text-gray-500 mt-1">Số công thức được tạo theo tháng</p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-gray-500">
          <div className="text-right">
            <p className="text-gray-400">Tổng</p>
            <p className="font-bold text-gray-800 text-base">{total}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">TB/tháng</p>
            <p className="font-bold text-gray-800 text-base">{avg}</p>
          </div>
        </div>
      </div>

      {last7.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-300">
          <i className="fa fa-chart-bar text-4xl"></i>
        </div>
      ) : (
        <div className="relative">
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-48 mb-1">
            {last7.map((item, i) => {
              const heightPct = Math.max(Math.round((item.count / maxCount) * 100), 4)
              const isHovered = tooltip?.idx === i
              return (
                <div key={item.month}
                  className="flex-1 flex flex-col items-center justify-end relative h-full"
                  onMouseEnter={() => setTooltip({ idx: i, x: i })}
                  onMouseLeave={() => setTooltip(null)}>
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg">
                      {item.count} công thức
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-200 ${isHovered ? 'bg-orange-600' : 'bg-orange-400'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              )
            })}
          </div>

          {/* SVG line overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ bottom: '24px', top: 0 }}>
            <svg
              viewBox={`0 0 100 ${CHART_H}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Area fill */}
              <path d={areaPath} fill="rgba(249,115,22,0.08)" />
              {/* Line */}
              <path d={linePath} fill="none" stroke="#f97316" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
              {/* Dots */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5"
                  fill="white" stroke="#f97316" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* X labels */}
          <div className="flex justify-between mt-2">
            {last7.map(item => (
              <span key={item.month} className="flex-1 text-center text-xs text-gray-400 font-medium">
                {item.month}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
