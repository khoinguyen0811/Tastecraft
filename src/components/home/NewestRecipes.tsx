'use client'

import Link from 'next/link'
import { Recipe, difficultyLabel } from '@/types'
import RecipeImage from '@/components/ui/RecipeImage'
import Avatar from '@/components/ui/Avatar'

interface Props {
  recipes: Recipe[]
}

export default function NewestRecipes({ recipes }: Props) {
  if (!recipes.length) return null

  return (
    <section className="mb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Mới nhất</span>
          <h2 className="text-3xl font-bold mt-2">Vừa được chia sẻ</h2>
        </div>
        <Link href="/recipes" className="text-sm font-bold border-b-2 border-orange-500 pb-1">
          Xem tất cả <i className="fa fa-arrow-right ml-1 text-[10px]"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map(recipe => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition group"
          >
            <div className="h-48 overflow-hidden">
              <RecipeImage
                src={recipe.image_main}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-sm mb-1 line-clamp-2">{recipe.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">{recipe.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span><i className="far fa-clock mr-1"></i>{recipe.cooking_time}p</span>
                  <span className="text-orange-500 font-medium">{difficultyLabel[recipe.difficulty]}</span>
                </div>
                <Avatar src={recipe.users.avatar} name={recipe.users.username} size="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
