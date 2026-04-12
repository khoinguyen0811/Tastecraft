'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area
} from 'recharts'

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

const MONTH_NAMES = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-bold mb-0.5">Ngày {label}</p>
      <p className="text-orange-300">{payload[0]?.value ?? 0} công thức</p>
    </div>
  )
}

export default function BarChart({ dailyData, currentMonth, currentYear }: Props) {
  const today = new Date().getDate()
  const total = dailyData.reduce((s, d) => s + d.count, 0)
  const todayCount = dailyData.find(d => d.day === today)?.count ?? 0

  // Chỉ hiện data đến hôm nay, tương lai để count = null để không vẽ line
  const chartData = dailyData.map(d => ({
    day: d.day,
    count: d.day <= today ? d.count : null,
    bar: d.count,
    isToday: d.day === today,
  }))

  // Chỉ hiện label ngày 1, 5, 10, 15, 20, 25, cuối tháng
  const showDays = new Set([1, 5, 10, 15, 20, 25, dailyData.length])

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
            <p className="font-extrabold text-gray-800 text-2xl">{total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hôm nay</p>
            <p className="font-extrabold text-orange-500 text-2xl">{todayCount}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#fb923c" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => showDays.has(v) ? String(v) : ''}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />

          <Bar dataKey="bar" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={14} />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#f97316', stroke: 'white', strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
