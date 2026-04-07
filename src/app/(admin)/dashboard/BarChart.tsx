'use client'

interface MonthlyData {
  month: string
  count: number
}

interface BarChartProps {
  monthlyData: MonthlyData[]
}

export default function BarChart({ monthlyData }: BarChartProps) {
  const last7 = monthlyData.slice(-7)
  const maxCount = Math.max(...last7.map(d => d.count), 1)

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Xu hướng đăng tải công thức</h3>
          <p className="text-sm text-gray-500 mt-1">Số công thức được tạo theo tháng</p>
        </div>
        <div className="flex space-x-4 text-xs font-medium text-gray-500">
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> Công thức
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 gap-2">
        {last7.map((item) => {
          const heightPct = Math.round((item.count / maxCount) * 100)
          return (
            <div
              key={item.month}
              className="w-full flex flex-col justify-end items-center relative group cursor-pointer"
            >
              <div
                className="w-full bg-orange-500 rounded-t-lg transition group-hover:bg-orange-600 absolute bottom-0"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              ></div>
              <span className="absolute -bottom-6 text-xs text-gray-400 font-medium whitespace-nowrap">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>
      <div className="h-8"></div>
    </div>
  )
}
