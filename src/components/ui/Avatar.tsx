'use client'

import { useState } from 'react'

const COLORS = [
  'bg-orange-500', 'bg-rose-500', 'bg-violet-500',
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500',
]

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function isValidUrl(src?: string | null): boolean {
  if (!src) return false
  // Chỉ chấp nhận URL bắt đầu bằng http/https hoặc /
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

interface Props {
  src?: string | null
  name: string
  size?: string
  className?: string
}

export default function Avatar({ src, name, size = 'w-10 h-10', className = '' }: Props) {
  const [error, setError] = useState(() => !isValidUrl(src))
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  const color = getColor(name ?? '')

  const showImage = !error

  if (showImage) {
    return (
      <img
        src={src!}
        alt={name}
        onError={() => setError(true)}
        className={`${size} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center shrink-0 ${className}`}>
      <span className="text-white font-bold text-sm leading-none select-none">{initial}</span>
    </div>
  )
}
