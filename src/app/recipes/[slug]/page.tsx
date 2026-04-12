import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RecipeHero from '@/components/detail/RecipeHero'
import RecipeActionBar from '@/components/detail/RecipeActionBar'
import IngredientList from '@/components/detail/IngredientList'
import StepList from '@/components/detail/StepList'
import CommunityPhotos from '@/components/detail/CommunityPhotos'
import FeedbackSection from '@/components/detail/FeedbackSection'
import RecipeImage from '@/components/ui/RecipeImage'
import { RecipeDetail } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('recipes')
    .select(`
      id, title, slug, image_main, description, cooking_time, servings, difficulty, is_active, created_at,
      user_id,
      users ( username, avatar, rank ),
      recipe_ingredients ( id, name, quantity ),
      recipe_steps ( id, step_num, content, note, step_image ),
      recipe_feedbacks (
        id, rating, content, result_image, created_at,
        users ( username, avatar )
      ),
      recipe_tag ( tags ( id, name, type, slug ) )
    `)
    .eq('slug', slug)
    .single()

  if (!data) notFound()

  // Nếu công thức bị ẩn, chỉ chủ sở hữu mới xem được
  const { data: { user } } = await supabase.auth.getUser()
  if (data.is_active === false && (data as any).user_id !== user?.id) notFound()

  const recipe: RecipeDetail = {
    ...data,
    users: (data as any).users,
    tags: (data as any).recipe_tag?.map((rt: any) => rt.tags).filter(Boolean) ?? [],
    recipe_ingredients: (data as any).recipe_ingredients ?? [],
    recipe_steps: (data as any).recipe_steps ?? [],
    recipe_feedbacks: (data as any).recipe_feedbacks ?? [],
  }

  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id)
      .maybeSingle()
    isSaved = !!saved
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">
        Khám phá công thức &gt; <span className="text-gray-800">{recipe.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="lg:w-2/5 lg:sticky lg:top-24">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            <RecipeImage src={recipe.image_main} alt={recipe.title} className="w-full h-[600px] object-cover" />
            <div className="absolute top-6 left-6 space-y-2">
              <span className="block bg-black/40 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full uppercase">
                <i className="far fa-clock mr-1"></i> {recipe.cooking_time} phút
              </span>
              <span className="block bg-black/40 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full uppercase">
                <i className="fa fa-utensils mr-1"></i>
                {recipe.difficulty === '1' ? 'Dễ' : recipe.difficulty === '2' ? 'Trung bình' : 'Nâng cao'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5">
          <RecipeHero recipe={recipe} />
          <RecipeActionBar recipeId={recipe.id} slug={recipe.slug} initialSaved={isSaved} />
          <IngredientList ingredients={recipe.recipe_ingredients} defaultServings={recipe.servings ?? 2} />
          <StepList steps={recipe.recipe_steps} />
        </div>
      </div>

      <FeedbackSection
        recipeId={recipe.id}
        slug={recipe.slug}
        feedbacks={recipe.recipe_feedbacks}
        isLoggedIn={!!user}
      />
      <CommunityPhotos feedbacks={recipe.recipe_feedbacks} />
    </div>
  )
}
