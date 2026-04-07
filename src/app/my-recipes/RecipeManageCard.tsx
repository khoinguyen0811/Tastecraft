'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import RecipeImage from '@/components/ui/RecipeImage'
import { toggleRecipeActive, deleteRecipe } from './actions'
import { difficultyLabel, type Difficulty } from '@/types'

interface Props {
  recipe: {
    id: number
    title: string
    slug: string
    image_main: string
    cooking_time: number
    difficulty: Difficulty
    is_active: boolean
    forced_hidden: boolean
    created_at: string
    review_count: number
  }
}

export default function RecipeManageCard({ recipe }: Props) {
  const [isActive, setIsActive] = useState(recipe.is_active)
  const isForcedHidden = recipe.forced_hidden
  const [isPendingToggle, startToggle] = useTransition()
  const [isPendingDelete, startDelete] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleRecipeActive(recipe.id, isActive)
      if (!result.error) setIsActive(result.newState!)
    })
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteRecipe(recipe.id)
    })
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition ${isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
      <div className="relative h-44">
        <RecipeImage src={recipe.image_main} alt={recipe.title} className="w-full h-full object-cover" />
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
          isForcedHidden ? 'bg-red-500 text-white' : isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
        }`}>
          {isForcedHidden ? '⚠ Vi phạm' : isActive ? 'Đang hiển thị' : 'Đã ẩn'}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-sm mb-1 line-clamp-2">{recipe.title}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span><i className="far fa-clock mr-1"></i>{recipe.cooking_time} phút</span>
          <span>{difficultyLabel[recipe.difficulty]}</span>
          <span><i className="fa fa-comment mr-1"></i>{recipe.review_count} đánh giá</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle active — disabled nếu bị admin buộc ẩn */}
          <button
            onClick={handleToggle}
            disabled={isPendingToggle || isForcedHidden}
            title={isForcedHidden ? 'Công thức bị ẩn do vi phạm, không thể bật lại' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
              isForcedHidden
                ? 'bg-red-50 text-red-400 cursor-not-allowed'
                : isActive
                ? 'bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600'
                : 'bg-green-50 hover:bg-green-100 text-green-600'
            }`}
          >
            <i className={`fa ${isForcedHidden ? 'fa-ban' : isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            {isPendingToggle ? '...' : isForcedHidden ? 'Bị khoá' : isActive ? 'Gỡ xuống' : 'Đăng lên'}
          </button>

          {/* Edit */}
          <Link
            href={`/recipes/${recipe.slug}`}
            className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition text-gray-500"
          >
            <i className="fa fa-external-link-alt text-xs"></i>
          </Link>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={handleDelete} disabled={isPendingDelete}
                className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition">
                {isPendingDelete ? '...' : 'Xác nhận'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 bg-gray-100 rounded-xl text-xs text-gray-500 hover:bg-gray-200 transition">
                Huỷ
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl transition text-gray-400">
              <i className="far fa-trash-alt text-xs"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
