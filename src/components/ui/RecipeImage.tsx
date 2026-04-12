'use client'

import { useState, useEffect } from 'react'

function isValidUrl(src?: string | null): boolean {
  if (!src) return false
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

const PLACEHOLDER = '/stasteplaceholderimg.avif'

interface Props {
  src?: string | null
  alt: string
  className?: string
}

export default function RecipeImage({ src, alt, className = '' }: Props) {
  const [broken, setBroken] = useState(false)

  // Reset broken state khi src thay đổi
  useEffect(() => {
    setBroken(false)
  }, [src])

  // Nếu src không hợp lệ hoặc đã bị lỗi → dùng placeholder
  const imgSrc = (!isValidUrl(src) || broken) ? PLACEHOLDER : src!

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  )
}
