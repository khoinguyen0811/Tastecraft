'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const avatar = formData.get('avatar') as string // URL từ Cloudinary

  const updates: Record<string, string> = { username, bio }
  if (avatar) updates.avatar = avatar

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const newPassword = formData.get('newPassword') as string
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }
  return { success: true }
}
