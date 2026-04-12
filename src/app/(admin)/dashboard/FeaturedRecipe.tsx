import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'

interface FeaturedRecipeData {
  id: number
  title: string
  slug: string
  description: string
  image_main: string
  saved_count: number
}

export default function FeaturedRecipe({ recipe }: { recipe: FeaturedRecipeData | null }) {
  if (!recipe) {
    return (
      <div className="bg-[#f8f9f7] rounded-[2rem] p-6 shadow-sm flex items-center gap-6 border border-gray-100">
        <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center shrink-0">
          <i className="fa fa-image text-4xl text-gray-400"></i>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-[#b47a3c] uppercase tracking-widest mb-2">Công thức nổi bật</p>
          <h3 className="text-xl font-bold text-gray-400">Chưa có công thức nào</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9f7] rounded-[2rem] p-6 shadow-sm flex items-center gap-6 border border-gray-100">
      <div className="w-48 h-48 rounded-2xl shrink-0 shadow-lg overflow-hidden bg-gray-100">
        <RecipeImage
          src={recipe.image_main}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[#b47a3c] uppercase tracking-widest mb-2">Công thức nổi bật</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{recipe.description}</p>
        <p className="text-sm font-bold text-orange-500 mb-4">
          <i className="fa fa-heart mr-1"></i>{recipe.saved_count.toLocaleString()} lượt lưu
        </p>
        <Link href={`/recipes/${recipe.slug}`}
          className="text-sm font-bold text-[#b47a3c] hover:underline">
          Xem chi tiết →
        </Link>
      </div>
    </div>
  )
}
