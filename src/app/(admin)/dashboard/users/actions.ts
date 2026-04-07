'use server'

import { createClient } from '@/lib/supabase/server'
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
