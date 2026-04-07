'use client'

import { RecipeStep } from '@/types'
import { useState } from 'react'

interface Props {
  steps: RecipeStep[]
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  if (error) return null
  return (
    <div className="mt-6 rounded-[2rem] overflow-hidden">
      <img
        src={src}
        className="w-full h-80 object-cover"
        alt={alt}
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function StepList({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.step_num - b.step_num)

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-8">Các bước thực hiện</h2>
      <div className="space-y-10">
        {sorted.map(step => (
          <div key={step.id}>
            <div className="flex gap-6">
              <span className="text-4xl font-bold text-orange-200 shrink-0">
                {String(step.step_num).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-gray-500 leading-relaxed">{step.content}</p>
                {step.note && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                    <i className="fa fa-lightbulb text-amber-400 mt-0.5 shrink-0"></i>
                    <p className="text-amber-700 text-sm leading-relaxed">{step.note}</p>
                  </div>
                )}
              </div>
            </div>
            {step.step_image && (
              <StepImage src={step.step_image} alt={`Bước ${step.step_num}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
