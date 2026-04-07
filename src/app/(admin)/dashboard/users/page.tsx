import { requireAdmin } from '../../_components/requireAdmin'
import AdminHeader from '../../_components/AdminHeader'
import UserTable from './UserTable'

export default async function UsersPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: users } = await supabase
    .from('users')
    .select('id, username, email, role, avatar, created_at')
    .order('created_at', { ascending: false })

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar} title="Quản lý người dùng" subtitle={`${users?.length ?? 0} tài khoản`} />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <UserTable users={users ?? []} />
      </main>
    </>
  )
}
