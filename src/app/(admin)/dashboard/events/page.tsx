import { requireAdmin } from '../../_components/requireAdmin'
import AdminHeader from '../../_components/AdminHeader'
import EventList from './EventList'

export default async function EventsPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: events } = await supabase
    .from('events')
    .select(`id, title, description, banner_image, start_date, end_date, is_active, max_recipes_per_user, created_at,
      event_participants ( id )`)
    .order('created_at', { ascending: false })

  const mapped = (events ?? []).map((e: any) => ({
    ...e,
    participant_count: e.event_participants?.length ?? 0,
    max_recipes_per_user: e.max_recipes_per_user ?? 2,
  }))

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar} title="Sự kiện & Thử thách" subtitle={`${mapped.length} sự kiện`} />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <EventList events={mapped} adminId={profile.username} />
      </main>
    </>
  )
}
