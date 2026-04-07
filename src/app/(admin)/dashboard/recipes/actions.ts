'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleRecipeActiveAdmin(id: number, current: boolean) {
  const admin = createAdminClient()
  const { error } = await admin.from('recipes').update({ is_active: !current }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/recipes')
  return { success: true }
}

export async function deleteRecipeAdmin(id: number) {
  const admin = createAdminClient()
  const { error } = await admin.from('recipes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/recipes')
  return { success: true }
}
