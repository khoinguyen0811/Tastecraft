import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminHeader from '../_components/AdminHeader'
import StatsCards from './StatsCards'
import BarChart from './BarChart'
import FeaturedRecipe from './FeaturedRecipe'
import RecentActivity from './RecentActivity'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users').select('role, username, avatar').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  const [{ count: totalUsers }, { count: totalRecipes }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const { data: allRecipes } = await supabase
    .from('recipes').select('created_at')
    .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  const monthMap: Record<string, number> = {}
  ;(allRecipes ?? []).forEach(r => {
    const key = `Th ${new Date(r.created_at).getMonth() + 1}`
    monthMap[key] = (monthMap[key] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthMap).map(([month, count]) => ({ month, count }))

  const { data: featuredRows } = await supabase.from('saved_recipes').select('recipe_id').limit(1000)
  let featuredRecipe = null
  if (featuredRows?.length) {
    const countMap: Record<number, number> = {}
    featuredRows.forEach(r => { countMap[r.recipe_id] = (countMap[r.recipe_id] ?? 0) + 1 })
    const topId = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0]
    if (topId) {
      const { data: recipe } = await supabase.from('recipes')
        .select('id, title, slug, description, image_main').eq('id', Number(topId[0])).single()
      if (recipe) featuredRecipe = { ...recipe, saved_count: Number(topId[1]) }
    }
  }

  const [{ data: recentUsers }, { data: recentRecipes }] = await Promise.all([
    supabase.from('users').select('id, username, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('recipes').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <>
      <AdminHeader username={profile.username} avatar={profile.avatar} title="Tổng quan hệ thống" subtitle="Tóm tắt hoạt động của Bếp Nhà Làm" />
      <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8">
        <div className="space-y-6">
          <StatsCards totalUsers={totalUsers ?? 0} totalRecipes={totalRecipes ?? 0} reportCount={0} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BarChart monthlyData={monthlyData} />
              <FeaturedRecipe recipe={featuredRecipe} />
            </div>
            <RecentActivity recentUsers={recentUsers ?? []} recentRecipes={recentRecipes ?? []} />
          </div>
        </div>
      </main>
    </>
  )
}
