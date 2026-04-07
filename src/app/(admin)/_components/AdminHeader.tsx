interface Props {
  username: string
  avatar?: string | null
  title: string
  subtitle?: string
}

export default function AdminHeader({ username, avatar, title, subtitle }: Props) {
  const avatarUrl = avatar?.startsWith('http')
    ? avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1f2937&color=fff`

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-gray-200 shrink-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600">
          <i className="far fa-bell text-xl"></i>
        </button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{username}</p>
            <p className="text-xs text-gray-400">Quản trị viên</p>
          </div>
          <img src={avatarUrl} className="w-9 h-9 rounded-full object-cover" alt={username} />
        </div>
      </div>
    </header>
  )
}
