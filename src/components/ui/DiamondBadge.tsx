export default function DiamondBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md'
    ? 'w-7 h-7 text-base'
    : 'w-5 h-5 text-xs'

  return (
    <span
      className={`${cls} rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-400 flex items-center justify-center shadow-lg diamond-shake`}
      title="Diamond rank"
    >
      💎
    </span>
  )
}
