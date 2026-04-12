import { createClient } from '@/lib/supabase/server'
import HeroBanner from '@/components/home/HeroBanner'
import TrendingRecipes from '@/components/home/TrendingRecipes'
import NewestRecipes from '@/components/home/NewestRecipes'
import MasterclassGrid from '@/components/home/MasterclassGrid'
import { Recipe } from '@/types'

function mapRecipe(r: any): Recipe {
  return {
    ...r,
    users: r.users,
    tags: r.recipe_tag?.map((rt: any) => rt.tags).filter(Boolean) ?? [],
    avg_rating: r.recipe_feedbacks?.length
      ? r.recipe_feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / r.recipe_feedbacks.length
      : 0,
    review_count: r.recipe_feedbacks?.length ?? 0,
  }
}

const SELECT_FIELDS = `
  id, title, slug, image_main, description, cooking_time, difficulty, created_at,
  users ( username, avatar, rank ),
  recipe_feedbacks ( rating ),
  recipe_tag ( tags ( id, name, type, slug ) )
`

export default async function HomePage() {
  const supabase = await createClient()

  // Trending: lấy nhiều hơn rồi sort theo số feedback phía JS
  const [{ data: allRecipes }, { data: newestRaw }] = await Promise.all([
    supabase
      .from('recipes')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .limit(20),
    supabase
      .from('recipes')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  // Sort theo số lượng feedback giảm dần → lấy top 3
  const trending: Recipe[] = (allRecipes ?? [])
    .map(mapRecipe)
    .sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
    .slice(0, 3)

  const newest: Recipe[] = (newestRaw ?? []).map(mapRecipe)

  return (
    <div className="px-6 pb-20">
      <HeroBanner />
      <TrendingRecipes recipes={trending} />
      <NewestRecipes recipes={newest} />
      <MasterclassGrid />
    </div>
  )
}
