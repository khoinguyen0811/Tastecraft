'use client'

import Link from 'next/link'
import { Recipe, difficultyLabel } from '@/types'
import Avatar from '@/components/ui/Avatar'
import RecipeImage from '@/components/ui/RecipeImage'

interface Props {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: Props) {
  const rating = recipe.avg_rating ?? 0
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <Link href={`/recipes/${recipe.slug}`} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 group block">
      <div className="relative h-64">
        <RecipeImage
          src={recipe.image_main}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white" onClick={e => e.preventDefault()}>
          <i className="far fa-heart text-gray-700"></i>
        </button>
      </div>
      <div className="p-6">
        <div className="flex text-orange-400 text-sm mb-2">
          {Array.from({ length: fullStars }).map((_, i) => <i key={i} className="fa fa-star"></i>)}
          {hasHalf && <i className="fa fa-star-half-alt"></i>}
          {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => <i key={i} className="far fa-star"></i>)}
          <span className="text-gray-400 ml-2">({recipe.review_count ?? 0} đánh giá)</span>
        </div>
        <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span><i className="far fa-clock mr-1"></i>{recipe.cooking_time} phút</span>
            <span><i className="fa fa-utensils mr-1"></i>{difficultyLabel[recipe.difficulty]}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar src={recipe.users.avatar} name={recipe.users.username} size="w-6 h-6" />
            <span className="text-xs text-gray-500">{recipe.users.username}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
