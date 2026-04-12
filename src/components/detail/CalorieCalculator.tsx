'use client'

import { useState } from 'react'

interface Ingredient {
  name: string
  quantity: string
}

interface NutritionData {
  total_calories: number
  per_serving_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  summary: string
}

interface Props {
  ingredients: Ingredient[]
  servings: number
}

export default function CalorieCalculator({ ingredients, servings }: Props) {
  const [data, setData] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function calculate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, servings }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setOpen(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const macros = data ? [
    { label: 'Protein', value: data.protein_g, unit: 'g', color: 'bg-blue-400', pct: Math.round((data.protein_g * 4 / data.per_serving_calories) * 100) },
    { label: 'Carbs', value: data.carbs_g, unit: 'g', color: 'bg-orange-400', pct: Math.round((data.carbs_g * 4 / data.per_serving_calories) * 100) },
    { label: 'Chất béo', value: data.fat_g, unit: 'g', color: 'bg-yellow-400', pct: Math.round((data.fat_g * 9 / data.per_serving_calories) * 100) },
    { label: 'Chất xơ', value: data.fiber_g, unit: 'g', color: 'bg-green-400', pct: 0 },
  ] : []

  return (
    <div className="mt-6">
      <button
        onClick={calculate}
        disabled={loading || ingredients.length === 0}
        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
      >
        {loading ? (
          <><i className="fa fa-spinner fa-spin"></i> AI đang tính toán...</>
        ) : (
          <><i className="fa fa-fire-alt"></i> Tính calo bằng AI</>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-500"><i className="fa fa-exclamation-circle mr-1"></i>{error}</p>
      )}

      {open && data && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa fa-robot text-purple-500"></i>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Phân tích dinh dưỡng AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">
              <i className="fa fa-times"></i>
            </button>
          </div>

          {/* Calo chính */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-purple-600">{data.per_serving_calories}</p>
              <p className="text-xs text-gray-500">kcal / phần</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-600">{data.total_calories}</p>
              <p className="text-xs text-gray-500">kcal tổng ({servings} phần)</p>
            </div>
          </div>

          {/* Macro bars */}
          <div className="space-y-2 mb-4">
            {macros.filter(m => m.pct > 0).map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{m.label}</span>
                  <span className="text-gray-500">{m.value}g · {m.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`${m.color} h-1.5 rounded-full transition-all`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
            {/* Fiber riêng */}
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 font-medium">Chất xơ</span>
              <span className="text-gray-500">{data.fiber_g}g</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-xs text-gray-500 italic border-t border-purple-100 pt-3">
            <i className="fa fa-lightbulb text-yellow-400 mr-1"></i>{data.summary}
          </p>
          <p className="text-[10px] text-gray-400 mt-2">* Ước tính bởi Gemini AI, chỉ mang tính tham khảo</p>
        </div>
      )}
    </div>
  )
}
