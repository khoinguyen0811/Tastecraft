'use client'

import Link from 'next/link'
import { Recipe, difficultyLabel } from '@/types'
import Avatar from '@/components/ui/Avatar'
import RecipeImage from '@/components/ui/RecipeImage'

interface Props {
  recipes: Recipe[]
}

export default function TrendingRecipes({ recipes }: Props) {
  const featured = recipes[0]
  const secondary = recipes.slice(1, 3)

  return (
    <section className="mb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Lựa chọn của giám tuyển</span>
          <h2 className="text-3xl font-bold mt-2">Đang thịnh hành</h2>
        </div>
        <Link href="/recipes" className="text-sm font-bold border-b-2 border-orange-500 pb-1">
          Xem tất cả công thức <i className="fa fa-arrow-right ml-1 text-[10px]"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featured && (
          <Link href={`/recipes/${featured.slug}`} className="md:col-span-2 bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
            <div className="h-[400px] overflow-hidden relative">
              <RecipeImage
                src={featured.image_main}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            </div>
            <div className="p-8">
              <div className="flex space-x-2 mb-4">
                {featured.tags?.map(tag => (
                  <span key={tag.id} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold uppercase">{tag.name}</span>
                ))}
              </div>
              <h3 className="text-2xl font-bold mb-4">{featured.title}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed line-clamp-2">{featured.description}</p>
              <div className="flex items-center space-x-3">
                <Avatar src={featured.users.avatar} name={featured.users.username} size="w-10 h-10" />
                <div>
                  <p className="text-sm font-bold text-gray-800">{featured.users.username}</p>
                  <p className="text-[10px] text-gray-400 uppercase">Chuyên gia ẩm thực</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-8">
          {secondary.map(recipe => (
            <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full hover:shadow-lg transition">
              <div className="h-48 overflow-hidden">
                <RecipeImage
                  src={recipe.image_main}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="font-bold text-lg mb-2">{recipe.title}</h4>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{recipe.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">
                    {difficultyLabel[recipe.difficulty]}
                  </span>
                  <i className="fa fa-ellipsis-h text-gray-300"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
