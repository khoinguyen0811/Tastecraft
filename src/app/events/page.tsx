import { createClient } from '@/lib/supabase/server'
import RecipeImage from '@/components/ui/RecipeImage'
import Link from 'next/link'

export default async function EventsPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: events } = await supabase
    .from('events')
    .select(`id, title, description, banner_image, start_date, end_date, is_active,
      event_participants ( id )`)
    .eq('is_active', true)
    .gte('end_date', now)
    .order('start_date', { ascending: true })

  const mapped = (events ?? []).map((e: any) => ({
    ...e,
    participant_count: e.event_participants?.length ?? 0,
    is_ongoing: new Date(e.start_date) <= new Date(),
  }))

  const ongoing = mapped.filter(e => e.is_ongoing)
  const upcoming = mapped.filter(e => !e.is_ongoing)

  return (
    <div className="px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Cộng đồng</span>
        <h1 className="text-4xl font-bold font-serif mt-2 mb-3">Sự kiện & Thử thách</h1>
        <p className="text-gray-400 max-w-lg mx-auto">Tham gia các thử thách nấu ăn cùng cộng đồng Culinaria. Chia sẻ công thức, nhận phản hồi và kết nối với những người yêu bếp.</p>
      </div>

      {/* Đang diễn ra */}
      {ongoing.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold">Đang diễn ra</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ongoing.map(event => (
              <EventCard key={event.id} event={event} status="ongoing" />
            ))}
          </div>
        </section>
      )}

      {/* Sắp diễn ra */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Sắp diễn ra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} status="upcoming" />
            ))}
          </div>
        </section>
      )}

      {mapped.length === 0 && (
        <div className="text-center py-24">
          <i className="fa fa-trophy text-5xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400">Hiện chưa có sự kiện nào đang diễn ra.</p>
          <p className="text-gray-300 text-sm mt-1">Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, status }: { event: any; status: 'ongoing' | 'upcoming' }) {
  const daysLeft = Math.ceil((new Date(event.end_date).getTime() - Date.now()) / 86400000)
  const daysUntil = Math.ceil((new Date(event.start_date).getTime() - Date.now()) / 86400000)

  return (
    <Link href={`/events/${event.id}`} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition group block">
      <div className="relative h-52 overflow-hidden">
        <RecipeImage
          src={event.banner_image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-4 left-4">
          {status === 'ongoing' ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Đang diễn ra
            </span>
          ) : (
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Sắp diễn ra
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
          <span><i className="far fa-calendar mr-1"></i>
            {new Date(event.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          <span>→</span>
          <span>{new Date(event.end_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          <span className="ml-auto flex items-center gap-1">
            <i className="fa fa-users"></i> {event.participant_count}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${status === 'ongoing' ? 'text-orange-500' : 'text-blue-500'}`}>
            {status === 'ongoing'
              ? daysLeft <= 1 ? 'Kết thúc hôm nay!' : `Còn ${daysLeft} ngày`
              : daysUntil <= 1 ? 'Bắt đầu ngày mai' : `Bắt đầu sau ${daysUntil} ngày`
            }
          </span>
          <span className="text-orange-500 text-xs font-bold flex items-center gap-1">
            Xem chi tiết <i className="fa fa-arrow-right text-[10px]"></i>
          </span>
        </div>
      </div>
    </Link>
  )
}
