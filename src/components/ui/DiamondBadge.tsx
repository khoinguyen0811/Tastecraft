export default function DiamondBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md'
    ? 'w-7 h-7 text-base'
    : 'w-5 h-5 text-xs'

  return (
    <span
      className={`${cls} rounded-full flex items-center justify-center shadow-lg diamond-shake`}
      title="Diamond rank"
    >
      💎
    </span>
  )
}
