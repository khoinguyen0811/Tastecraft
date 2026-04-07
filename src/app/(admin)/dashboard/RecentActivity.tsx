function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  return `${days} ngày trước`
}

interface RecentUser {
  id: string
  username: string
  created_at: string
}

interface RecentRecipe {
  id: number
  title: string
  created_at: string
}

interface RecentActivityProps {
  recentUsers: RecentUser[]
  recentRecipes: RecentRecipe[]
}

type ActivityItem =
  | { type: 'user'; id: string; label: string; description: string; created_at: string }
  | { type: 'recipe'; id: number; label: string; description: string; created_at: string }

export default function RecentActivity({ recentUsers, recentRecipes }: RecentActivityProps) {
  const activities: ActivityItem[] = [
    ...recentUsers.map(u => ({
      type: 'user' as const,
      id: u.id,
      label: 'Người dùng mới đăng ký',
      description: `${u.username} vừa gia nhập cộng đồng Bếp Nhà Làm.`,
      created_at: u.created_at,
    })),
    ...recentRecipes.map(r => ({
      type: 'recipe' as const,
      id: r.id,
      label: 'Công thức mới được tải lên',
      description: `"${r.title}" vừa được đăng tải.`,
      created_at: r.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <i className="fa fa-ellipsis-h"></i>
        </button>
      </div>

      <div className="flex-1 space-y-6">
        {activities.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có hoạt động nào.</p>
        )}
        {activities.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            {item.type === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-1">
                <i className="fa fa-user-plus text-xs"></i>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                <i className="fa fa-cloud-upload-alt text-xs"></i>
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{item.label}</h4>
              <p className="text-xs text-gray-500 mb-1">{item.description}</p>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {timeAgo(item.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
        Xem tất cả hoạt động
      </button>
    </div>
  )
}
