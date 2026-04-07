'use client'

import { useState } from 'react'
import { RecipeIngredient } from '@/types'

interface Props {
  ingredients: RecipeIngredient[]
  defaultServings?: number
}

// Tách số và đơn vị từ chuỗi quantity, ví dụ "300g" → [300, "g"], "2 con" → [2, " con"]
function parseQuantity(qty: string): { num: number | null; unit: string } {
  const match = qty.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
  if (!match) return { num: null, unit: qty }
  return { num: parseFloat(match[1].replace(',', '.')), unit: match[2] }
}

function scaleQuantity(qty: string, ratio: number): string {
  const { num, unit } = parseQuantity(qty)
  if (num === null) return qty
  const scaled = num * ratio
  // Hiển thị số nguyên nếu không có phần thập phân
  const display = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1)
  return `${display}${unit}`
}

export default function IngredientList({ ingredients, defaultServings = 2 }: Props) {
  const [servings, setServings] = useState(defaultServings)
  const ratio = servings / defaultServings

  return (
    <div className="bg-[#f3f3f3] rounded-[2rem] p-8 mt-8">
      {/* Header + servings control */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold italic">Nguyên liệu</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Công thức gốc cho {defaultServings} người
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-1.5 shadow-sm">
          <button
            onClick={() => setServings(s => Math.max(1, s - 1))}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center font-bold transition"
          >
            <i className="fa fa-minus text-xs"></i>
          </button>
          <div className="text-center min-w-[60px]">
            <span className="font-bold text-sm">{servings}</span>
            <span className="text-xs text-gray-400 ml-1">người</span>
          </div>
          <button
            onClick={() => setServings(s => Math.min(20, s + 1))}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center font-bold transition"
          >
            <i className="fa fa-plus text-xs"></i>
          </button>
        </div>
      </div>

      {/* Ingredient list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {ingredients.map(ing => (
          <label key={ing.id} className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 accent-orange-500 shrink-0" />
            <span className="text-gray-600 group-hover:text-black transition text-sm">
              <span className="font-medium text-gray-800">
                {scaleQuantity(ing.quantity, ratio)}
              </span>{' '}
              {ing.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
