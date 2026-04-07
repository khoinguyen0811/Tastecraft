import { requireAdmin } from '../../_components/requireAdmin'
import AdminHeader from '../../_components/AdminHeader'
import ReportTable from './ReportTable'

export default async function ReportsPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: reports } = await supabase
    .from('recipe_reports')
    .select(`
      id, reason, note, status, created_at,
      recipes ( id, title, slug ),
      users ( username )
    `)
    .order('created_at', { ascending: false })

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar}
        title="Báo cáo vi phạm"
        subtitle={`${reports?.filter((r: any) => r.status === 'pending').length ?? 0} chờ xử lý`} />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <ReportTable reports={(reports ?? []) as any[]} />
      </main>
    </>
  )
}
