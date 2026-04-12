import { RecipeDetail, difficultyLabel } from '@/types'
import Avatar from '@/components/ui/Avatar'
import DiamondBadge from '@/components/ui/DiamondBadge'

interface Props {
  recipe: RecipeDetail
}

export default function RecipeHero({ recipe }: Props) {
  const dietTags = recipe.tags?.filter(t => t.type === 'diet') ?? []

  return (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold font-serif leading-tight mb-4">{recipe.title}</h1>
      <p className="text-gray-500 leading-relaxed mb-6 text-lg">{recipe.description}</p>

      <div className="flex flex-wrap gap-6 mb-6 border-y border-gray-200 py-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <i className="fa fa-bolt"></i>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Độ khó</p>
            <p className="font-bold">{difficultyLabel[recipe.difficulty]}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <i className="far fa-clock"></i>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Thời gian</p>
            <p className="font-bold">{recipe.cooking_time} phút</p>
          </div>
        </div>
        {dietTags.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <i className="fa fa-leaf"></i>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold">Chế độ ăn</p>
              <p className="font-bold text-sm">{dietTags.map(t => t.name).join(', ')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar
            src={recipe.users.avatar}
            name={recipe.users.username}
            size="w-10 h-10"
            className={(recipe.users as any).rank === 'Diamond' ? 'diamond-border' : ''}
          />
          {(recipe.users as any).rank === 'Diamond' && (
            <div className="absolute -top-2 -right-2">
              <DiamondBadge size="sm" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm">{recipe.users.username}</p>
            {(recipe.users as any).rank === 'Diamond' && (
              <span className="text-xs text-cyan-500 font-bold">Diamond</span>
            )}
          </div>
          <p className="text-xs text-gray-400 uppercase">Tác giả công thức</p>
        </div>
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {recipe.tags.map(tag => (
            <span
              key={tag.id}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                tag.type === 'diet'
                  ? 'bg-green-100 text-green-700'
                  : tag.type === 'time'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </>
  )
}
