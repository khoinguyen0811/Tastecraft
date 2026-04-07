interface StatsCardsProps {
  totalUsers: number
  totalRecipes: number
  reportCount: number
}

export default function StatsCards({ totalUsers, totalRecipes, reportCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa fa-users"></i>
          </div>
          <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
            <i className="fa fa-arrow-up mr-1"></i> Active
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng người dùng</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{totalUsers.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa fa-utensils"></i>
          </div>
          <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
            <i className="fa fa-arrow-up mr-1"></i> Active
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng công thức</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{totalRecipes.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa fa-exclamation-circle"></i>
          </div>
          {reportCount > 0 && (
            <span className="text-red-500 text-xs font-bold px-2 py-1 flex items-center">Khẩn cấp</span>
          )}
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Báo cáo vi phạm</p>
          <h3 className={`text-3xl font-extrabold ${reportCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {reportCount}
          </h3>
        </div>
      </div>
    </div>
  )
}
