import { requireAdmin } from '../../_components/requireAdmin'
import AdminHeader from '../../_components/AdminHeader'
import RecipeAdminTable from './RecipeAdminTable'

export default async function AdminRecipesPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: recipes } = await supabase
    .from('recipes')
    .select(`id, title, slug, image_main, difficulty, is_active, created_at, users ( username )`)
    .order('created_at', { ascending: false })

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar} title="Quản lý công thức" subtitle={`${recipes?.length ?? 0} công thức`} />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <RecipeAdminTable recipes={(recipes ?? []).map((r: any) => ({ ...r, author: r.users?.username ?? '—' }))} />
      </main>
    </>
  )
}
