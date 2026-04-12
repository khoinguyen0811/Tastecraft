import { createAdminClient } from './supabase/admin'

export const XP_MAP = {
  POST: 20,
  COMMENT: 5,
  LIKE: 2,
  EVENT_JOIN: 30,
  EVENT_WIN: 100,
} as const

export type XPAction = keyof typeof XP_MAP

// Rate limits per action
const RATE_LIMITS: Record<XPAction, { max: number; windowMs: number }> = {
  POST:       { max: 3,  windowMs: 24 * 60 * 60 * 1000 }, // 3/day
  COMMENT:    { max: 10, windowMs: 60 * 60 * 1000 },       // 10/hour
  LIKE:       { max: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50/day
  EVENT_JOIN: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
  EVENT_WIN:  { max: 5,  windowMs: 24 * 60 * 60 * 1000 },
}

// Diminishing returns: count trong ngày
function calculateXP(baseXP: number, countToday: number): number {
  if (countToday <= 1) return baseXP
  if (countToday === 2) return Math.floor(baseXP * 0.6)
  if (countToday === 3) return Math.floor(baseXP * 0.2)
  return 0
}

export async function awardXP(
  userId: string,
  action: XPAction,
  refId?: string
): Promise<{ success: boolean; points?: number; reason?: string }> {
  const admin = createAdminClient()

  // 1. Kiểm tra shadow ban
  const { data: user } = await admin
    .from('users')
    .select('is_shadow_banned, xp')
    .eq('id', userId)
    .single()

  if (!user) return { success: false, reason: 'User not found' }

  // Shadow ban: vẫn log nhưng không cộng XP thực
  const isShadowBanned = user.is_shadow_banned

  // 2. Rate limit check
  const limit = RATE_LIMITS[action]
  const windowStart = new Date(Date.now() - limit.windowMs).toISOString()

  const { count: recentCount } = await admin
    .from('user_points')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart)

  if ((recentCount ?? 0) >= limit.max) {
    return { success: false, reason: 'Rate limit exceeded' }
  }

  // 3. Diminishing returns — đếm hôm nay
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: todayCount } = await admin
    .from('user_points')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', todayStart.toISOString())

  const baseXP = XP_MAP[action]
  const points = calculateXP(baseXP, (todayCount ?? 0) + 1)

  // 4. Abuse detection: > 200 XP trong 1 giờ → flag
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: recentPoints } = await admin
    .from('user_points')
    .select('points')
    .eq('user_id', userId)
    .gte('created_at', hourAgo)

  const xpLastHour = (recentPoints ?? []).reduce((sum, r) => sum + r.points, 0)
  if (xpLastHour > 200) {
    // Flag user nhưng không block — shadow ban
    await admin.from('users').update({ is_shadow_banned: true }).eq('id', userId)
    return { success: false, reason: 'Abuse detected, account flagged' }
  }

  // 5. Log XP (luôn log kể cả shadow ban)
  await admin.from('user_points').insert({
    user_id: userId,
    action,
    points: isShadowBanned ? 0 : points,
    ref_id: refId ?? null,
  })

  // 6. Cộng XP thực (bỏ qua nếu shadow ban hoặc points = 0)
  if (!isShadowBanned && points > 0) {
    await admin.rpc('increment_xp', { user_uuid: userId, amount: points })
  }

  return { success: true, points: isShadowBanned ? 0 : points }
}

export function getRankInfo(xp: number) {
  const ranks = [
    { name: 'Diamond', min: 1500, color: 'text-cyan-400', bg: 'bg-cyan-50', icon: '💎' },
    { name: 'Platinum', min: 700, color: 'text-purple-500', bg: 'bg-purple-50', icon: '🔮' },
    { name: 'Gold', min: 300, color: 'text-yellow-500', bg: 'bg-yellow-50', icon: '🥇' },
    { name: 'Silver', min: 100, color: 'text-gray-400', bg: 'bg-gray-100', icon: '🥈' },
    { name: 'Bronze', min: 0, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🥉' },
  ]
  const current = ranks.find(r => xp >= r.min)!
  const next = ranks[ranks.indexOf(current) - 1]
  const progress = next
    ? Math.round(((xp - current.min) / (next.min - current.min)) * 100)
    : 100
  return { ...current, next, progress, xp }
}
