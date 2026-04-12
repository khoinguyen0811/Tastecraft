import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'
import Avatar from '@/components/ui/Avatar'
import { difficultyLabel, type Difficulty } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`id, title, description, banner_image, start_date, end_date, is_active, created_by, max_recipes_per_user`)
    .eq('id', id)
    .single()

  if (!event || !event.is_active) notFound()

  // Lấy user hiện tại
  const { data: { user } } = await supabase.auth.getUser()

  // Kiểm tra user đã tham gia chưa và đã gửi bao nhiêu công thức
  let hasJoined = false
  let userSubmitCount = 0
  const maxPerUser = (event as any).max_recipes_per_user ?? 2
  if (user) {
    const { data: joined, count } = await supabase
      .from('event_participants')
      .select('id', { count: 'exact' })
      .eq('event_id', id)
      .eq('user_id', user.id)
    hasJoined = (count ?? 0) > 0
    userSubmitCount = count ?? 0
  }

  // Lấy danh sách công thức tham gia event
  const { data: participants } = await supabase
    .from('event_participants')
    .select(`
      id, joined_at,
      users ( username, avatar ),
      recipes ( id, title, slug, image_main, cooking_time, difficulty, description )
    `)
    .eq('event_id', id)
    .order('joined_at', { ascending: false })

  const now = new Date()
  const isOngoing = new Date(event.start_date) <= now && new Date(event.end_date) >= now
  const isEnded = new Date(event.end_date) < now
  const daysLeft = Math.ceil((new Date(event.end_date).getTime() - now.getTime()) / 86400000)

  // Admin là người tạo event
  const isAdmin = user?.id === event.created_by

  return (
    <div className="px-4 py-10 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden h-72 mb-10 shadow-xl">
        <RecipeImage src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-10">
          <div className="flex items-center gap-3 mb-3">
            {isEnded ? (
              <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Đã kết thúc</span>
            ) : isOngoing ? (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Đang diễn ra · Còn {daysLeft} ngày
              </span>
            ) : (
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Sắp diễn ra</span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white font-serif">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT — info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-bold mb-4">Thông tin sự kiện</h3>
            {event.description && <p className="text-sm text-gray-500 leading-relaxed mb-5">{event.description}</p>}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-500">
                <i className="fa fa-calendar-alt w-4 text-orange-400"></i>
                <span>Bắt đầu: {new Date(event.start_date).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <i className="fa fa-calendar-check w-4 text-orange-400"></i>
                <span>Kết thúc: {new Date(event.end_date).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <i className="fa fa-users w-4 text-orange-400"></i>
                <span>{participants?.length ?? 0} người tham gia</span>
              </div>
            </div>
          </div>

          {/* Nút tham gia */}
          {isOngoing && !isEnded && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm">
              {!user ? (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Đăng nhập để tham gia sự kiện này.</p>
                  <Link href="/login" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm">
                    Đăng nhập
                  </Link>
                </div>
              ) : hasJoined && userSubmitCount >= maxPerUser ? (
                <div className="text-center">
                  <i className="fa fa-check-circle text-green-500 text-2xl mb-2 block"></i>
                  <p className="text-sm font-bold text-green-600 mb-1">Đã đạt giới hạn!</p>
                  <p className="text-xs text-gray-400">Bạn đã gửi {userSubmitCount}/{maxPerUser} công thức.</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tạo công thức để tham gia thử thách này.</p>
                  {hasJoined && <p className="text-xs text-orange-500 mb-3">Đã gửi {userSubmitCount}/{maxPerUser} công thức</p>}
                  <Link
                    href={`/recipes/create?event=${event.id}`}
                    className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm"
                  >
                    <i className="fa fa-plus mr-2"></i>Tham gia ngay
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — danh sách công thức */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-5">
            Công thức tham gia <span className="text-gray-400 font-normal text-base">({participants?.length ?? 0})</span>
          </h2>

          {(!participants || participants.length === 0) ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
              <i className="fa fa-utensils text-4xl text-gray-200 mb-4 block"></i>
              <p className="text-gray-400">Chưa có công thức nào tham gia.</p>
              {isOngoing && user && !hasJoined && (
                <Link href={`/recipes/create?event=${event.id}`}
                  className="inline-block mt-4 text-orange-500 font-bold text-sm hover:underline">
                  Hãy là người đầu tiên!
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((p: any) => {
                const recipe = p.recipes
                if (!recipe) return null
                return (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <RecipeImage src={recipe.image_main} alt={recipe.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Chỉ admin (người tạo event) mới xem được chi tiết */}
                      {isAdmin ? (
                        <Link href={`/recipes/${recipe.slug}`}
                          className="font-bold text-sm hover:text-orange-500 transition line-clamp-1">
                          {recipe.title}
                        </Link>
                      ) : (
                        <p className="font-bold text-sm line-clamp-1">{recipe.title}</p>
                      )}
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-2">{recipe.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span><i className="far fa-clock mr-1"></i>{recipe.cooking_time} phút</span>
                        <span className="text-orange-500">{difficultyLabel[recipe.difficulty as Difficulty]}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end justify-between">
                      <Avatar src={p.users?.avatar} name={p.users?.username ?? '?'} size="w-8 h-8" />
                      <span className="text-[10px] text-gray-300">
                        {new Date(p.joined_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
