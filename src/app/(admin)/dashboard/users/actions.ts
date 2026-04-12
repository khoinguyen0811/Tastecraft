'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleUserRole(userId: string, newRole: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('users').update({ role: newRole }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('users').delete().eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function banUser(userId: string, days: number) {
  const admin = createAdminClient()
  const bannedUntil = days === 0
    ? null // unban
    : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await admin.from('users').update({ banned_until: bannedUntil }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function updateUserXP(userId: string, xp: number) {
  const admin = createAdminClient()

  // Tính rank mới
  let rank = 'Bronze'
  if (xp >= 1500) rank = 'Diamond'
  else if (xp >= 700) rank = 'Platinum'
  else if (xp >= 300) rank = 'Gold'
  else if (xp >= 100) rank = 'Silver'

  const { error } = await admin.from('users').update({ xp, rank }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}
