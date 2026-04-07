'use client'

import { useState } from 'react'
import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'
import Avatar from '@/components/ui/Avatar'
import { difficultyLabel, type Difficulty } from '@/types'

interface SavedRecipe {
  id: number
  title: string
  slug: string
  image_main: string
  description: string
  cooking_time: number
  difficulty: Difficulty
  avg_rating: number
  review_count: number
  users: { username: string; avatar: string }
}

const PREVIEW_COUNT = 3

export default function SavedRecipes({ recipes }: { recipes: SavedRecipe[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? recipes : recipes.slice(0, PREVIEW_COUNT)

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Kho công thức</h2>
        <span className="text-sm text-gray-400">{recipes.length} đã lưu</span>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <i className="fa fa-heart text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400 text-sm">Bạn chưa lưu công thức nào.</p>
          <Link href="/recipes" className="inline-block mt-4 text-orange-500 font-bold text-sm hover:underline">
            Khám phá công thức ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayed.map(recipe => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <RecipeImage
                    src={recipe.image_main}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-1 truncate">{recipe.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{recipe.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span><i className="far fa-clock mr-1"></i>{recipe.cooking_time} phút</span>
                    <span className="text-orange-500 font-medium">{difficultyLabel[recipe.difficulty]}</span>
                    {recipe.review_count > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="fa fa-star text-orange-400 text-[10px]"></i>
                        {recipe.avg_rating.toFixed(1)}
                        <span className="text-gray-300">({recipe.review_count})</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <Avatar src={recipe.users.avatar} name={recipe.users.username} size="w-7 h-7" />
                </div>
              </Link>
            ))}
          </div>

          {recipes.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full mt-4 py-2.5 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
            >
              {showAll
                ? 'Thu gọn'
                : `Xem thêm ${recipes.length - PREVIEW_COUNT} công thức`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
