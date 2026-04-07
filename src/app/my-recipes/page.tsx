import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecipeManageCard from './RecipeManageCard'
import { type Difficulty } from '@/types'

export default async function MyRecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipesRaw } = await supabase
    .from('recipes')
    .select(`
      id, title, slug, image_main, cooking_time, difficulty, is_active, forced_hidden, created_at,
      recipe_feedbacks ( id )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recipes = (recipesRaw ?? []).map((r: any) => ({
    ...r,
    is_active: r.is_active ?? true,
    forced_hidden: r.forced_hidden ?? false,
    review_count: r.recipe_feedbacks?.length ?? 0,
  }))

  const activeCount = recipes.filter((r: any) => r.is_active).length
  const hiddenCount = recipes.length - activeCount

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Công thức của tôi</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeCount} đang hiển thị · {hiddenCount} đã ẩn
          </p>
        </div>
        <Link
          href="/recipes/create"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <i className="fa fa-plus"></i> Tạo mới
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-24">
          <i className="fa fa-book-open text-5xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400 mb-4">Bạn chưa có công thức nào.</p>
          <Link href="/recipes/create"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
            Tạo công thức đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <RecipeManageCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
