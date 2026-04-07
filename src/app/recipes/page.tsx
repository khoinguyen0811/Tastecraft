import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import RecipeCard from '@/components/recipes/RecipeCard'
import FilterSidebar from '@/components/recipes/FilterSidebar'
import ProBanner from '@/components/recipes/ProBanner'
import { Recipe, Tag } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; tag?: string | string[] }>
}

async function RecipeResults({ q, tags }: { q: string; tags: string[] }) {
  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select(`
      id, title, slug, image_main, description, cooking_time, difficulty, created_at,
      users ( username, avatar ),
      recipe_feedbacks ( rating ),
      recipe_tag ( tags ( id, name, type, slug ) )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Tìm kiếm theo tên
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: recipesRaw } = await query

  let recipes: Recipe[] = (recipesRaw ?? []).map((r: any) => ({
    ...r,
    users: r.users,
    tags: r.recipe_tag?.map((rt: any) => rt.tags).filter(Boolean) ?? [],
    avg_rating: r.recipe_feedbacks?.length
      ? r.recipe_feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / r.recipe_feedbacks.length
      : 0,
    review_count: r.recipe_feedbacks?.length ?? 0,
  }))

  // Filter theo tags phía client (Supabase không hỗ trợ filter nested array dễ)
  if (tags.length > 0) {
    recipes = recipes.filter(r =>
      tags.every(tagSlug => r.tags?.some(t => t.slug === tagSlug))
    )
  }

  return (
    <>
      <div className="mb-6">
        {q && (
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
            Kết quả cho &ldquo;{q}&rdquo;
          </h1>
        )}
        <p className="text-gray-500 text-sm">
          Tìm thấy {recipes.length} công thức{tags.length > 0 ? ' phù hợp' : ''}
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa fa-search text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400">Không tìm thấy công thức nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      <ProBanner />
    </>
  )
}

export default async function RecipesPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q ?? ''
  const tags = Array.isArray(params.tag)
    ? params.tag
    : params.tag ? [params.tag] : []

  const supabase = await createClient()
  const { data: tagsRaw } = await supabase.from('tags').select('*')
  const allTags: Tag[] = tagsRaw ?? []
  const cuisineTags = allTags.filter(t => t.type === 'method')
  const dietTags = allTags.filter(t => t.type === 'diet')

  return (
    <div className="px-4 py-8 flex flex-col md:flex-row gap-8">
      <Suspense>
        <FilterSidebar cuisineTags={cuisineTags} dietTags={dietTags} />
      </Suspense>

      <div className="flex-1 min-w-0">
        {!q && tags.length === 0 && (
          <div className="mb-6">
            <nav className="text-xs text-gray-400 uppercase mb-2">Trang chủ &gt; Khám phá công thức</nav>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Khám phá công thức</h1>
          </div>
        )}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        }>
          <RecipeResults q={q} tags={tags} />
        </Suspense>
      </div>
    </div>
  )
}
