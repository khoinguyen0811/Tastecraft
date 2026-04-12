import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import SavedRecipes from './SavedRecipes'
import RankCard from './RankCard'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: savedRaw }] = await Promise.all([
    supabase
      .from('users')
      .select('username, bio, avatar, email, created_at, xp, rank')
      .eq('id', user.id)
      .single(),
    supabase
      .from('saved_recipes')
      .select(`
        saved_at,
        recipes (
          id, title, slug, image_main, description, cooking_time, difficulty,
          users ( username, avatar ),
          recipe_feedbacks ( rating )
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false }),
  ])

  const savedRecipes = (savedRaw ?? [])
    .map((s: any) => s.recipes)
    .filter(Boolean)
    .map((r: any) => ({
      ...r,
      users: r.users,
      avg_rating: r.recipe_feedbacks?.length
        ? r.recipe_feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / r.recipe_feedbacks.length
        : 0,
      review_count: r.recipe_feedbacks?.length ?? 0,
    }))

  if (!profile) redirect('/login')

  const safeProfile = profile as NonNullable<typeof profile>

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Trang cá nhân</h1>
          <p className="text-gray-400 text-sm mt-1">{safeProfile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
        {/* LEFT: form thông tin */}
        <div className="lg:col-span-1 space-y-4">
          <RankCard xp={safeProfile.xp ?? 0} rank={safeProfile.rank ?? 'Bronze'} />
          <ProfileForm profile={safeProfile} />
        </div>

        {/* RIGHT: kho công thức */}
        <div className="lg:col-span-2">
          <SavedRecipes recipes={savedRecipes} />
        </div>
      </div>
    </div>
  )
}
