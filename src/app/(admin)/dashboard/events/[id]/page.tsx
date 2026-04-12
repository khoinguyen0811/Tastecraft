import { requireAdmin } from '../../../_components/requireAdmin'
import AdminHeader from '../../../_components/AdminHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'
import Avatar from '@/components/ui/Avatar'
import { difficultyLabel, type Difficulty } from '@/types'
import RemoveParticipantButton from './RemoveParticipantButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventParticipantsPage({ params }: Props) {
  const { id } = await params
  const { profile } = await requireAdmin()
  const admin = createAdminClient()

  const { data: event } = await admin
    .from('events')
    .select('id, title, max_recipes_per_user, start_date, end_date')
    .eq('id', id)
    .single()

  if (!event) return <div className="p-8 text-gray-400">Không tìm thấy sự kiện.</div>

  const { data: participants } = await admin
    .from('event_participants')
    .select(`
      id, joined_at,
      users ( id, username, avatar ),
      recipes ( id, title, slug, image_main, cooking_time, difficulty )
    `)
    .eq('event_id', id)
    .order('joined_at', { ascending: false })

  // Group by user
  const byUser: Record<string, { user: any; entries: any[] }> = {}
  ;(participants ?? []).forEach((p: any) => {
    const uid = p.users?.id
    if (!uid) return
    if (!byUser[uid]) byUser[uid] = { user: p.users, entries: [] }
    byUser[uid].entries.push(p)
  })

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar}
        title={event.title}
        subtitle={`${participants?.length ?? 0} lượt tham gia · Giới hạn ${event.max_recipes_per_user} công thức/user`} />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <div className="mb-4">
          <Link href="/dashboard/events" className="text-sm text-gray-400 hover:text-orange-500 transition">
            <i className="fa fa-arrow-left mr-2"></i>Quay lại danh sách sự kiện
          </Link>
        </div>

        {Object.keys(byUser).length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
            <i className="fa fa-users text-4xl text-gray-200 mb-4 block"></i>
            <p className="text-gray-400">Chưa có người tham gia.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(byUser).map(({ user, entries }) => (
              <div key={user.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 mb-5">
                  <Avatar src={user.avatar} name={user.username} size="w-10 h-10" />
                  <div>
                    <p className="font-bold">{user.username}</p>
                    <p className="text-xs text-gray-400">{entries.length}/{event.max_recipes_per_user} công thức</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {entries.map((entry: any) => {
                    const r = entry.recipes
                    if (!r) return null
                    return (
                      <div key={entry.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <RecipeImage src={r.image_main} alt={r.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{r.title}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span><i className="far fa-clock mr-1"></i>{r.cooking_time} phút</span>
                            <span>{difficultyLabel[r.difficulty as Difficulty]}</span>
                            <span className="text-gray-300">{new Date(entry.joined_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/recipes/${r.slug}`} target="_blank"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-medium transition">
                            Xem
                          </Link>
                          <RemoveParticipantButton participantId={entry.id} eventId={id} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
