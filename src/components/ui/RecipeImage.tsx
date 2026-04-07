'use client'

import { useState } from 'react'

function isValidUrl(src?: string | null): boolean {
  if (!src) return false
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

interface Props {
  src?: string | null
  alt: string
  className?: string
}

export default function RecipeImage({ src, alt, className = '' }: Props) {
  // Khởi tạo error = true ngay nếu src không hợp lệ — tránh flash broken image khi hydrate
  const [error, setError] = useState(() => !isValidUrl(src))

  const imgSrc = error ? '/stasteplaceholderimg.avif' : src!

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
